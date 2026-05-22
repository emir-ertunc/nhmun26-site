import { requireAdmin } from '../../_shared/adminAuth'
import type { D1Database, D1Value } from '../../_shared/d1'
import { errorResponse, jsonResponse } from '../../_shared/http'

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

const validStatuses = new Set([
  'new',
  'reviewing',
  'accepted',
  'waitlisted',
  'rejected',
])

const validRoles = new Set([
  'Chair',
  'Delegate',
  'Delegation',
  'Organization Team',
  'Press',
])

function getLimit(value: string | null) {
  const limit = Number(value ?? 50)
  if (!Number.isFinite(limit)) {
    return 50
  }
  return Math.min(Math.max(Math.floor(limit), 1), 100)
}

function getOffset(value: string | null) {
  const offset = Number(value ?? 0)
  if (!Number.isFinite(offset)) {
    return 0
  }
  return Math.max(Math.floor(offset), 0)
}

export async function onRequestGet({ env, request }: PagesFunctionContext) {
  const admin = await requireAdmin(request, env)
  if (!admin.ok) {
    return jsonResponse(admin.body, admin.status)
  }

  if (!env.DB) {
    return errorResponse(
      503,
      'database_unavailable',
      'Application database is not configured yet.',
    )
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const role = url.searchParams.get('role')
  const query = url.searchParams.get('q')?.trim()
  const limit = getLimit(url.searchParams.get('limit'))
  const offset = getOffset(url.searchParams.get('offset'))
  const whereParts: string[] = []
  const values: D1Value[] = []

  if (status && validStatuses.has(status)) {
    whereParts.push('status = ?')
    values.push(status)
  }

  if (role && validRoles.has(role)) {
    whereParts.push('role = ?')
    values.push(role)
  }

  if (query) {
    whereParts.push(
      '(full_name LIKE ? OR email LIKE ? OR school LIKE ? OR city LIKE ?)',
    )
    const likeQuery = `%${query}%`
    values.push(likeQuery, likeQuery, likeQuery, likeQuery)
  }

  const whereClause =
    whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''
  const rows = await env.DB.prepare(
    `SELECT
      id,
      created_at,
      updated_at,
      role,
      full_name,
      email,
      school,
      grade,
      city,
      status,
      review_score
    FROM applications
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?`,
  )
    .bind(...values, limit, offset)
    .all()
  const total = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM applications ${whereClause}`,
  )
    .bind(...values)
    .first<{ count: number }>()

  return jsonResponse({
    applications: rows.results ?? [],
    limit,
    offset,
    ok: true,
    total: total?.count ?? 0,
  })
}
