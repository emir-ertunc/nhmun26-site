import type { ApplicationRole } from '../data/application'

export type ApplicationFormValues = Record<string, string | boolean>

type ApplicationApiSuccess = {
  applicationId: string
  ok: true
}

type ApplicationApiFailure = {
  error?: {
    code?: string
    fields?: Record<string, string>
    message?: string
  }
  ok: false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isApiFailure(value: unknown): value is ApplicationApiFailure {
  return (
    isRecord(value) &&
    value.ok === false &&
    (!('error' in value) || isRecord(value.error))
  )
}

function isApiSuccess(value: unknown): value is ApplicationApiSuccess {
  return (
    isRecord(value) &&
    value.ok === true &&
    typeof value.applicationId === 'string'
  )
}

export class ApplicationSubmitError extends Error {
  fields?: Record<string, string>

  constructor(message: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApplicationSubmitError'
    this.fields = fields
  }
}

export async function submitApplicationForm(
  role: ApplicationRole,
  values: ApplicationFormValues,
  turnstileToken?: string,
) {
  const response = await fetch('/api/applications', {
    body: JSON.stringify({ role, turnstileToken, values }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new ApplicationSubmitError(
      'Application service is unavailable in this preview. Please try again from the deployed site.',
    )
  }

  if (!response.ok || isApiFailure(body)) {
    const message =
      isApiFailure(body) && body.error?.message
        ? body.error.message
        : 'Application could not be submitted. Please try again.'

    throw new ApplicationSubmitError(
      message,
      isApiFailure(body) ? body.error?.fields : undefined,
    )
  }

  if (!isApiSuccess(body)) {
    throw new ApplicationSubmitError(
      'Application service returned an unexpected response.',
    )
  }

  return body
}
