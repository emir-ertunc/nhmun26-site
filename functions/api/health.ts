import type { D1Database } from '../_shared/d1'
import { jsonResponse } from '../_shared/http'

type PagesFunctionContext = {
  env: {
    ADMIN_EMAIL_ALLOWLIST?: string
    CLOUDFLARE_ACCESS_AUD?: string
    CLOUDFLARE_ACCESS_TEAM_DOMAIN?: string
    DB?: D1Database
    EMAIL_FROM?: string
    EMAIL_NOTIFICATION_TO?: string
    EMAIL_REPLY_TO?: string
    PUBLIC_SITE_URL?: string
    RESEND_API_KEY?: string
    TURNSTILE_SECRET_KEY?: string
  }
}

type Check = {
  message: string
  ok: boolean
}

function hasValue(value: string | undefined) {
  return Boolean(value?.trim())
}

function checkEnv(value: string | undefined, label: string): Check {
  return {
    message: hasValue(value)
      ? `${label} is configured.`
      : `${label} is missing.`,
    ok: hasValue(value),
  }
}

async function checkDatabase(db: D1Database | undefined): Promise<Check> {
  if (!db) {
    return {
      message: 'D1 binding is missing.',
      ok: false,
    }
  }

  try {
    await db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM applications) as application_count,
          (SELECT COUNT(*) FROM audit_logs) as audit_log_count`,
      )
      .first()

    return {
      message: 'D1 binding and migrations are ready.',
      ok: true,
    }
  } catch {
    return {
      message: 'D1 binding exists, but migrations are not ready.',
      ok: false,
    }
  }
}

export async function onRequestGet({ env }: PagesFunctionContext) {
  const checks = {
    accessAudience: checkEnv(
      env.CLOUDFLARE_ACCESS_AUD,
      'Cloudflare Access audience',
    ),
    accessTeamDomain: checkEnv(
      env.CLOUDFLARE_ACCESS_TEAM_DOMAIN,
      'Cloudflare Access team domain',
    ),
    adminAllowlist: checkEnv(env.ADMIN_EMAIL_ALLOWLIST, 'Admin allowlist'),
    database: await checkDatabase(env.DB),
    emailFrom: checkEnv(env.EMAIL_FROM, 'Email sender'),
    emailReplyTo: checkEnv(env.EMAIL_REPLY_TO, 'Email reply-to'),
    notificationRecipients: {
      message: hasValue(env.EMAIL_NOTIFICATION_TO)
        ? 'Team notification recipients are configured.'
        : 'Team notification recipients are optional and missing.',
      ok: true,
    },
    publicSiteUrl: checkEnv(env.PUBLIC_SITE_URL, 'Public site URL'),
    resend: checkEnv(env.RESEND_API_KEY, 'Resend API key'),
    turnstile: checkEnv(env.TURNSTILE_SECRET_KEY, 'Turnstile secret'),
  }
  const requiredChecks = [
    checks.accessAudience,
    checks.accessTeamDomain,
    checks.adminAllowlist,
    checks.database,
    checks.emailFrom,
    checks.emailReplyTo,
    checks.publicSiteUrl,
    checks.resend,
    checks.turnstile,
  ]
  const ok = requiredChecks.every((check) => check.ok)

  return jsonResponse(
    {
      checks,
      ok,
    },
    ok ? 200 : 503,
  )
}
