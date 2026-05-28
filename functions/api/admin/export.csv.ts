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
  'Admin',
  'Chairboard',
  'Delegate',
  'Delegation',
  'Press',
])

const csvHeaders = [
  'id',
  'created_at',
  'updated_at',
  'role',
  'full_name',
  'email',
  'phone',
  'school',
  'grade',
  'date_of_birth',
  'gender',
  'experience',
  'status',
  'review_score',
  'reviewer_notes',
  'payload_json',
]

function csvEscape(value: unknown) {
  const stringValue = value === null || value === undefined ? '' : String(value)
  return `"${stringValue.replace(/"/g, '""')}"`
}

function getPayloadValue(payloadJson: unknown, key: string) {
  if (typeof payloadJson !== 'string') {
    return ''
  }

  try {
    const parsed = JSON.parse(payloadJson) as {
      values?: Record<string, unknown>
    }
    const value = parsed.values?.[key]
    return typeof value === 'string' ? value : ''
  } catch {
    return ''
  }
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
      '(full_name LIKE ? OR email LIKE ? OR school LIKE ? OR grade LIKE ? OR payload_json LIKE ?)',
    )
    const likeQuery = `%${query}%`
    values.push(likeQuery, likeQuery, likeQuery, likeQuery, likeQuery)
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
      phone,
      school,
      grade,
      experience,
      status,
      review_score,
      reviewer_notes,
      payload_json
    FROM applications
    ${whereClause}
    ORDER BY created_at DESC`,
  )
    .bind(...values)
    .all<Record<string, unknown>>()

  const csvRows = [
    csvHeaders.map(csvEscape).join(','),
    ...(rows.results ?? []).map((row) =>
      [
        row.id,
        row.created_at,
        row.updated_at,
        row.role,
        row.full_name,
        row.email,
        row.phone,
        row.school,
        row.grade,
        getPayloadValue(row.payload_json, 'dateOfBirth'),
        getPayloadValue(row.payload_json, 'gender'),
        row.experience,
        row.status,
        row.review_score,
        row.reviewer_notes,
        row.payload_json,
      ]
        .map(csvEscape)
        .join(','),
    ),
  ]

  return new Response(`${csvRows.join('\n')}\n`, {
    headers: {
      'cache-control': 'no-store',
      'content-disposition': 'attachment; filename="nhmun26-applications.csv"',
      'content-type': 'text/csv; charset=utf-8',
    },
    status: 200,
  })
}
