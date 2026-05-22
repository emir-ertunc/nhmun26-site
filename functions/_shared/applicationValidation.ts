export type ApplicationRole =
  | 'Delegate'
  | 'Delegation'
  | 'Chair'
  | 'Press'
  | 'Organization Team'

type ApplicationValues = Record<string, string | boolean>

type ValidationSuccess = {
  data: {
    emailNormalized: string
    payloadJson: string
    role: ApplicationRole
    values: ApplicationValues
  }
  ok: true
}

type ValidationFailure = {
  error: {
    code: 'invalid_payload' | 'validation_failed'
    fields: Record<string, string>
    message: string
  }
  ok: false
}

const personalFieldIds = [
  'fullName',
  'email',
  'phone',
  'school',
  'grade',
  'city',
  'experience',
] as const

const roleFieldIds = {
  Chair: [
    'preferredCommittee',
    'chairExperience',
    'academicExperience',
    'chairMotivation',
  ],
  Delegate: [
    'committeePreferences',
    'countryPreferences',
    'motivation',
    'previousConferences',
  ],
  Delegation: [
    'delegationName',
    'advisorName',
    'advisorEmail',
    'delegateCount',
    'delegationCommittees',
  ],
  'Organization Team': [
    'departmentPreference',
    'availability',
    'organizationExperience',
  ],
  Press: ['pressRole', 'portfolio', 'pressExperience'],
} as const satisfies Record<ApplicationRole, readonly string[]>

const roles = Object.keys(roleFieldIds) as ApplicationRole[]
const maxFieldLength = 5000
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(values: Record<string, unknown>, id: string) {
  const value = values[id]
  return typeof value === 'string' ? value.trim() : ''
}

function getBoolean(values: Record<string, unknown>, id: string) {
  return values[id] === true
}

function isApplicationRole(value: unknown): value is ApplicationRole {
  return typeof value === 'string' && roles.includes(value as ApplicationRole)
}

export function validateApplicationPayload(
  payload: unknown,
): ValidationSuccess | ValidationFailure {
  if (!isRecord(payload)) {
    return {
      error: {
        code: 'invalid_payload',
        fields: {},
        message: 'Application payload must be a JSON object.',
      },
      ok: false,
    }
  }

  const valuesSource = isRecord(payload.values) ? payload.values : payload
  const roleCandidate = payload.role ?? valuesSource.role
  const fields: Record<string, string> = {}

  if (!isApplicationRole(roleCandidate)) {
    fields.role = 'Select a valid application role.'
  }

  const role = isApplicationRole(roleCandidate) ? roleCandidate : 'Delegate'
  const requiredFieldIds = [...personalFieldIds, ...roleFieldIds[role]]
  const values: ApplicationValues = { role }

  for (const fieldId of requiredFieldIds) {
    const value = getString(valuesSource, fieldId)
    values[fieldId] = value

    if (!value) {
      fields[fieldId] = 'This field is required.'
    } else if (value.length > maxFieldLength) {
      fields[fieldId] = `Use ${maxFieldLength} characters or fewer.`
    }
  }

  const email = String(values.email ?? '')
  if (email && !emailPattern.test(email)) {
    fields.email = 'Enter a valid email address.'
  }

  const advisorEmail = String(values.advisorEmail ?? '')
  if (advisorEmail && !emailPattern.test(advisorEmail)) {
    fields.advisorEmail = 'Enter a valid advisor email address.'
  }

  values.consentTerms = getBoolean(valuesSource, 'consentTerms')
  values.consentContact = getBoolean(valuesSource, 'consentContact')

  if (!values.consentTerms) {
    fields.consentTerms = 'You must confirm the application statement.'
  }

  if (!values.consentContact) {
    fields.consentContact = 'You must allow NHMUN26 to contact you.'
  }

  if (Object.keys(fields).length > 0) {
    return {
      error: {
        code: 'validation_failed',
        fields,
        message: 'Please correct the highlighted fields.',
      },
      ok: false,
    }
  }

  const emailNormalized = email.toLowerCase()

  return {
    data: {
      emailNormalized,
      payloadJson: JSON.stringify({ role, values }),
      role,
      values,
    },
    ok: true,
  }
}
