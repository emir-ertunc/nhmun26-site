import { validateApplicationPayload } from '../_shared/applicationValidation'

type D1Value = string | number | null

type D1PreparedStatement = {
  bind: (...values: D1Value[]) => D1PreparedStatement
  first: <TRecord extends Record<string, unknown>>() => Promise<TRecord | null>
  run: () => Promise<unknown>
}

type D1Database = {
  prepare: (query: string) => D1PreparedStatement
}

type PagesFunctionContext = {
  env: {
    APP_ENV?: string
    DB?: D1Database
    TURNSTILE_SECRET_KEY?: string
  }
  request: Request
}

type TurnstileVerifyResponse = {
  'error-codes'?: string[]
  success?: boolean
}

type TurnstileVerification =
  | {
      ok: true
    }
  | {
      fields: Record<string, string>
      message: string
      ok: false
      status: number
    }

const jsonHeaders = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: jsonHeaders,
    status,
  })
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  return jsonResponse(
    {
      error: {
        code,
        fields,
        message,
      },
      ok: false,
    },
    status,
  )
}

function duplicateApplicationResponse() {
  return errorResponse(
    409,
    'duplicate_application',
    'An application for this email and role already exists.',
    { email: 'This email has already applied for this role.' },
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getTurnstileToken(payload: unknown) {
  if (!isRecord(payload)) {
    return ''
  }

  return typeof payload.turnstileToken === 'string'
    ? payload.turnstileToken.trim()
    : ''
}

function shouldSkipTurnstile(env: PagesFunctionContext['env']) {
  return (
    !env.TURNSTILE_SECRET_KEY &&
    ['development', 'local', 'test'].includes((env.APP_ENV ?? '').toLowerCase())
  )
}

async function verifyTurnstileToken({
  env,
  remoteIp,
  token,
}: {
  env: PagesFunctionContext['env']
  remoteIp: string | null
  token: string
}): Promise<TurnstileVerification> {
  if (shouldSkipTurnstile(env)) {
    return { ok: true }
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    return {
      fields: { turnstile: 'Security check is not configured.' },
      message: 'Application security check is not configured.',
      ok: false,
      status: 503,
    }
  }

  if (!token) {
    return {
      fields: { turnstile: 'Complete the security check.' },
      message: 'Complete the security check before submitting.',
      ok: false,
      status: 403,
    }
  }

  const formData = new FormData()
  formData.append('secret', env.TURNSTILE_SECRET_KEY)
  formData.append('response', token)
  formData.append('idempotency_key', crypto.randomUUID())

  if (remoteIp) {
    formData.append('remoteip', remoteIp)
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        body: formData,
        method: 'POST',
      },
    )
    const result = (await response.json()) as TurnstileVerifyResponse

    if (response.ok && result.success) {
      return { ok: true }
    }
  } catch {
    return {
      fields: { turnstile: 'Security check could not be verified.' },
      message: 'Security check could not be verified. Please try again.',
      ok: false,
      status: 502,
    }
  }

  return {
    fields: { turnstile: 'Security check failed. Try again.' },
    message: 'Security check failed. Please try again.',
    ok: false,
    status: 403,
  }
}

async function hashHeader(value: string | null) {
  if (!value) {
    return null
  }

  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      allow: 'POST, OPTIONS',
    },
    status: 204,
  })
}

export async function onRequestPost({ env, request }: PagesFunctionContext) {
  if (!env.DB) {
    return errorResponse(
      503,
      'database_unavailable',
      'Application database is not configured yet.',
    )
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 100_000) {
    return errorResponse(413, 'payload_too_large', 'Application is too large.')
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return errorResponse(
      400,
      'invalid_json',
      'Request body must be valid JSON.',
    )
  }

  const clientIp =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')
  const turnstile = await verifyTurnstileToken({
    env,
    remoteIp: clientIp,
    token: getTurnstileToken(payload),
  })

  if (!turnstile.ok) {
    return errorResponse(
      turnstile.status ?? 403,
      'turnstile_failed',
      turnstile.message,
      turnstile.fields,
    )
  }

  const validation = validateApplicationPayload(payload)
  if (!validation.ok) {
    return jsonResponse({ error: validation.error, ok: false }, 422)
  }

  const { emailNormalized, payloadJson, role, values } = validation.data
  const existing = await env.DB.prepare(
    'SELECT id FROM applications WHERE email_normalized = ? AND role = ? LIMIT 1',
  )
    .bind(emailNormalized, role)
    .first<{ id: string }>()

  if (existing) {
    return duplicateApplicationResponse()
  }

  const applicationId = crypto.randomUUID()
  const userAgent = request.headers.get('user-agent')
  const [ipHash, userAgentHash] = await Promise.all([
    hashHeader(clientIp),
    hashHeader(userAgent),
  ])

  try {
    await env.DB.prepare(
      `INSERT INTO applications (
      id,
      role,
      full_name,
      email,
      email_normalized,
      phone,
      school,
      grade,
      city,
      experience,
      payload_json,
      consent_terms,
      consent_contact,
      ip_hash,
      user_agent_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        applicationId,
        role,
        String(values.fullName),
        String(values.email),
        emailNormalized,
        String(values.phone),
        String(values.school),
        String(values.grade),
        String(values.city),
        String(values.experience),
        payloadJson,
        values.consentTerms ? 1 : 0,
        values.consentContact ? 1 : 0,
        ipHash,
        userAgentHash,
      )
      .run()
  } catch (error) {
    const errorMessage = getErrorMessage(error).toLowerCase()
    if (
      errorMessage.includes('unique') ||
      errorMessage.includes('constraint')
    ) {
      return duplicateApplicationResponse()
    }

    return errorResponse(
      500,
      'database_write_failed',
      'Application could not be saved. Please try again.',
    )
  }

  try {
    await env.DB.prepare(
      `INSERT INTO audit_logs (
        id,
        application_id,
        event_type,
        actor,
        metadata_json
      ) VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        applicationId,
        'application_submitted',
        'applicant',
        JSON.stringify({ role }),
      )
      .run()
  } catch {
    // The application write is the source of truth; audit logging must not block applicants.
  }

  return jsonResponse(
    {
      applicationId,
      ok: true,
    },
    201,
  )
}
