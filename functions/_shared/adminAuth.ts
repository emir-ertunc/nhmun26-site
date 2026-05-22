type AdminEnv = {
  ADMIN_EMAIL_ALLOWLIST?: string
  APP_ENV?: string
  CLOUDFLARE_ACCESS_AUD?: string
  CLOUDFLARE_ACCESS_TEAM_DOMAIN?: string
}

type AccessKey = {
  alg: string
  e: string
  kid: string
  kty: string
  n: string
  use: string
}

type AccessJwtPayload = {
  aud?: string | string[]
  email?: string
  exp?: number
  nbf?: number
}

type AdminAuthSuccess = {
  email: string
  ok: true
}

type AdminAuthFailure = {
  body: {
    error: {
      code: string
      message: string
    }
    ok: false
  }
  ok: false
  status: number
}

function isLocal(env: AdminEnv) {
  return ['development', 'local', 'test'].includes(
    (env.APP_ENV ?? '').toLowerCase(),
  )
}

function parseAllowlist(value: string | undefined) {
  return new Set(
    (value ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

function authFailure(
  status: number,
  code: string,
  message: string,
): AdminAuthFailure {
  return {
    body: {
      error: {
        code,
        message,
      },
      ok: false,
    },
    ok: false,
    status,
  }
}

function decodeBase64Url(value: string) {
  const padded = value.padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    '=',
  )
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function decodeJsonPart<TValue>(value: string) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as TValue
}

async function verifyAccessJwt(token: string, env: AdminEnv) {
  const teamDomain = env.CLOUDFLARE_ACCESS_TEAM_DOMAIN
  const expectedAud = env.CLOUDFLARE_ACCESS_AUD

  if (!teamDomain || !expectedAud) {
    return authFailure(
      503,
      'access_not_configured',
      'Admin authentication is not configured.',
    )
  }

  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return authFailure(401, 'invalid_access_token', 'Invalid admin token.')
  }

  const header = decodeJsonPart<{ alg?: string; kid?: string }>(encodedHeader)
  const payload = decodeJsonPart<AccessJwtPayload>(encodedPayload)

  if (header.alg !== 'RS256' || !header.kid) {
    return authFailure(401, 'invalid_access_token', 'Invalid admin token.')
  }

  const certsResponse = await fetch(
    `https://${teamDomain}/cdn-cgi/access/certs`,
    {
      headers: {
        accept: 'application/json',
      },
    },
  )

  if (!certsResponse.ok) {
    return authFailure(
      503,
      'access_certs_unavailable',
      'Admin authentication certificates are unavailable.',
    )
  }

  const certs = (await certsResponse.json()) as { keys?: AccessKey[] }
  const accessKey = certs.keys?.find((key) => key.kid === header.kid)
  if (!accessKey) {
    return authFailure(401, 'invalid_access_token', 'Invalid admin token.')
  }

  const key = await crypto.subtle.importKey(
    'jwk',
    accessKey,
    {
      hash: 'SHA-256',
      name: 'RSASSA-PKCS1-v1_5',
    },
    false,
    ['verify'],
  )
  const signature = decodeBase64Url(encodedSignature)
  const signedData = new TextEncoder().encode(
    `${encodedHeader}.${encodedPayload}`,
  )
  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signature,
    signedData,
  )

  if (!verified) {
    return authFailure(401, 'invalid_access_token', 'Invalid admin token.')
  }

  const now = Math.floor(Date.now() / 1000)
  const tokenAudience = Array.isArray(payload.aud) ? payload.aud : [payload.aud]

  if (!payload.email || !tokenAudience.includes(expectedAud)) {
    return authFailure(401, 'invalid_access_token', 'Invalid admin token.')
  }

  if (
    (payload.nbf && payload.nbf > now) ||
    (payload.exp && payload.exp < now)
  ) {
    return authFailure(401, 'expired_access_token', 'Admin session expired.')
  }

  return {
    email: payload.email,
    ok: true,
  } as const
}

export async function requireAdmin(
  request: Request,
  env: AdminEnv,
): Promise<AdminAuthSuccess | AdminAuthFailure> {
  const allowlist = parseAllowlist(env.ADMIN_EMAIL_ALLOWLIST)
  if (allowlist.size === 0) {
    return authFailure(
      503,
      'allowlist_not_configured',
      'Admin email allowlist is not configured.',
    )
  }

  if (isLocal(env)) {
    const localEmail = request.headers.get('x-admin-email')?.trim()
    if (localEmail && allowlist.has(localEmail.toLowerCase())) {
      return {
        email: localEmail,
        ok: true,
      }
    }
  }

  const accessToken = request.headers.get('cf-access-jwt-assertion')
  if (!accessToken) {
    return authFailure(401, 'admin_auth_required', 'Admin access is required.')
  }

  const accessAuth = await verifyAccessJwt(accessToken, env)
  if (!accessAuth.ok) {
    return accessAuth
  }

  if (!allowlist.has(accessAuth.email.toLowerCase())) {
    return authFailure(403, 'admin_forbidden', 'Admin access is not allowed.')
  }

  return accessAuth
}
