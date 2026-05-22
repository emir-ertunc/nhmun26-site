import { requireAdmin } from '../../../_shared/adminAuth'
import type { D1Database, D1Value } from '../../../_shared/d1'
import { errorResponse, jsonResponse } from '../../../_shared/http'

type PagesFunctionContext = {
  env: {
    ADMIN_EMAIL_ALLOWLIST?: string
    APP_ENV?: string
    CLOUDFLARE_ACCESS_AUD?: string
    CLOUDFLARE_ACCESS_TEAM_DOMAIN?: string
    DB?: D1Database
  }
  params: {
    id?: string
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getApplicationId(params: PagesFunctionContext['params']) {
  return typeof params.id === 'string' ? params.id : ''
}

async function getApplication(db: D1Database, id: string) {
  return db
    .prepare(
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
        city,
        experience,
        payload_json,
        status,
        review_score,
        reviewer_notes,
        consent_terms,
        consent_contact
      FROM applications
      WHERE id = ?
      LIMIT 1`,
    )
    .bind(id)
    .first<Record<string, unknown>>()
}

export async function onRequestGet({
  env,
  params,
  request,
}: PagesFunctionContext) {
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

  const id = getApplicationId(params)
  const application = await getApplication(env.DB, id)
  if (!application) {
    return errorResponse(404, 'application_not_found', 'Application not found.')
  }

  return jsonResponse({
    application,
    ok: true,
  })
}

export async function onRequestPatch({
  env,
  params,
  request,
}: PagesFunctionContext) {
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

  const id = getApplicationId(params)
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

  if (!isRecord(payload)) {
    return errorResponse(400, 'invalid_payload', 'Request body is invalid.')
  }

  const updates: string[] = []
  const values: D1Value[] = []

  if ('status' in payload) {
    if (
      typeof payload.status !== 'string' ||
      !validStatuses.has(payload.status)
    ) {
      return errorResponse(
        422,
        'invalid_status',
        'Application status is invalid.',
      )
    }
    updates.push('status = ?')
    values.push(payload.status)
  }

  if ('reviewScore' in payload) {
    if (payload.reviewScore === null || payload.reviewScore === '') {
      updates.push('review_score = ?')
      values.push(null)
    } else if (
      typeof payload.reviewScore === 'number' &&
      Number.isInteger(payload.reviewScore) &&
      payload.reviewScore >= 0 &&
      payload.reviewScore <= 100
    ) {
      updates.push('review_score = ?')
      values.push(payload.reviewScore)
    } else {
      return errorResponse(422, 'invalid_score', 'Review score is invalid.')
    }
  }

  if ('reviewerNotes' in payload) {
    if (
      typeof payload.reviewerNotes !== 'string' ||
      payload.reviewerNotes.length > 5000
    ) {
      return errorResponse(422, 'invalid_notes', 'Reviewer notes are invalid.')
    }
    updates.push('reviewer_notes = ?')
    values.push(payload.reviewerNotes)
  }

  if (updates.length === 0) {
    return errorResponse(
      400,
      'empty_update',
      'No supported fields were provided.',
    )
  }

  const existing = await getApplication(env.DB, id)
  if (!existing) {
    return errorResponse(404, 'application_not_found', 'Application not found.')
  }

  updates.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")
  await env.DB.prepare(
    `UPDATE applications SET ${updates.join(', ')} WHERE id = ?`,
  )
    .bind(...values, id)
    .run()

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
      id,
      'application_review_updated',
      admin.email,
      JSON.stringify(payload),
    )
    .run()

  const application = await getApplication(env.DB, id)

  return jsonResponse({
    application,
    ok: true,
  })
}
