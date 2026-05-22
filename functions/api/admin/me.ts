import { requireAdmin } from '../../_shared/adminAuth'
import type { D1Database } from '../../_shared/d1'
import { jsonResponse } from '../../_shared/http'

type PagesFunctionContext = {
  env: {
    ADMIN_EMAIL_ALLOWLIST?: string
    APP_ENV?: string
    CLOUDFLARE_ACCESS_AUD?: string
    CLOUDFLARE_ACCESS_TEAM_DOMAIN?: string
    DB?: D1Database
  }
  request: Request
}

export async function onRequestGet({ env, request }: PagesFunctionContext) {
  const admin = await requireAdmin(request, env)
  if (!admin.ok) {
    return jsonResponse(admin.body, admin.status)
  }

  return jsonResponse({
    email: admin.email,
    ok: true,
  })
}
