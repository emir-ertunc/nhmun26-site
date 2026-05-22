export type AdminApplicationSummary = {
  city: string
  created_at: string
  email: string
  full_name: string
  grade: string
  id: string
  review_score: number | null
  role: string
  school: string
  status: string
  updated_at: string
}

export type AdminApplicationDetail = AdminApplicationSummary & {
  consent_contact: number
  consent_terms: number
  experience: string
  payload_json: string
  phone: string
  reviewer_notes: string | null
}

type ApiFailure = {
  error?: {
    message?: string
  }
  ok: false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getErrorMessage(value: unknown) {
  if (isRecord(value) && isRecord(value.error)) {
    return typeof value.error.message === 'string'
      ? value.error.message
      : 'Admin request failed.'
  }
  return 'Admin request failed.'
}

async function readAdminResponse<TSuccess>(response: Response) {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Admin API is unavailable in this preview.')
  }

  if (!response.ok || (isRecord(body) && body.ok === false)) {
    throw new Error(getErrorMessage(body as ApiFailure))
  }

  return body as TSuccess
}

export async function getAdminMe() {
  const response = await fetch('/api/admin/me', {
    headers: {
      accept: 'application/json',
    },
  })

  return readAdminResponse<{
    email: string
    ok: true
  }>(response)
}

export async function getAdminApplications({
  query,
  role,
  status,
}: {
  query: string
  role: string
  status: string
}) {
  const params = new URLSearchParams({
    limit: '50',
    offset: '0',
  })

  if (query) {
    params.set('q', query)
  }
  if (role !== 'all') {
    params.set('role', role)
  }
  if (status !== 'all') {
    params.set('status', status)
  }

  const response = await fetch(`/api/admin/applications?${params.toString()}`, {
    headers: {
      accept: 'application/json',
    },
  })

  return readAdminResponse<{
    applications: AdminApplicationSummary[]
    ok: true
    total: number
  }>(response)
}

export async function getAdminApplication(id: string) {
  const response = await fetch(`/api/admin/applications/${id}`, {
    headers: {
      accept: 'application/json',
    },
  })

  return readAdminResponse<{
    application: AdminApplicationDetail
    ok: true
  }>(response)
}

export async function updateAdminApplication(
  id: string,
  payload: {
    reviewerNotes: string
    reviewScore: number | null
    status: string
  },
) {
  const response = await fetch(`/api/admin/applications/${id}`, {
    body: JSON.stringify(payload),
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    method: 'PATCH',
  })

  return readAdminResponse<{
    application: AdminApplicationDetail
    ok: true
  }>(response)
}
