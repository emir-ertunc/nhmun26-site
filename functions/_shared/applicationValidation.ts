export type ApplicationRole =
  | 'Admin'
  | 'Press'
  | 'Delegation'
  | 'Delegate'
  | 'Chairboard'

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
  'dateOfBirth',
  'grade',
  'gender',
  'email',
  'phone',
  'school',
] as const

const roleFieldIds = {
  Admin: [
    'teammateScenario',
    'rudeInteractionScenario',
    'adminReadiness',
    'previousMunExperiences',
  ],
  Chairboard: [
    'preferredCommittees',
    'experienceList',
    'chairboardMotivation',
    'delegateDisagreementScenario',
  ],
  Delegate: ['experienceList', 'motivationLetter'],
  Delegation: ['delegationMemberCount', 'delegationRole'],
  Press: [
    'cameraModel',
    'photographyInterest',
    'additionalEquipment',
    'pressReadiness',
    'backlightScenario',
    'previousMunExperiences',
    'references',
  ],
} as const satisfies Record<ApplicationRole, readonly string[]>

const optionalRoleFieldIds = {
  Admin: ['additionalInfo', 'references'],
  Chairboard: [
    'directiveProcedure',
    'montcalmDirective',
    'lolKnowledge',
    'specialGaSeries',
    'gaProcedure',
    'supportDelegateScenario',
  ],
  Delegate: [],
  Delegation: [],
  Press: ['additionalInfo'],
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

function formatDateOfBirth(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) {
    return digits
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10)
  const groups = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ].filter(Boolean)

  return groups.join(' ')
}

function formatFieldValue(fieldId: string, value: string) {
  if (fieldId === 'dateOfBirth') {
    return formatDateOfBirth(value)
  }
  if (fieldId === 'phone') {
    return formatPhoneNumber(value)
  }
  if (fieldId === 'email') {
    return value.replace(/\s/g, '').toLowerCase()
  }
  return value
}

function isValidDateOfBirth(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) {
    return false
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  const now = new Date()

  return (
    year >= 1900 &&
    date <= now &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function isValidPhoneNumber(value: string) {
  return /^5\d{2} \d{3} \d{2} \d{2}$/.test(value)
}

function getBoolean(values: Record<string, unknown>, id: string) {
  return values[id] === true
}

function isApplicationRole(value: unknown): value is ApplicationRole {
  return typeof value === 'string' && roles.includes(value as ApplicationRole)
}

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length
}

function normalizePreferenceValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
}

function includesAny(value: string, terms: readonly string[]) {
  const normalizedValue = normalizePreferenceValue(value)
  return terms.some((term) => normalizedValue.includes(term))
}

function getConditionalChairboardRequiredFields(values: ApplicationValues) {
  const preferences =
    typeof values.preferredCommittees === 'string'
      ? values.preferredCommittees
      : ''
  const hasFcc = includesAny(preferences, ['fcc', 'league of legends', 'lol'])
  const hasSpecialGa = includesAny(preferences, ['special ga'])
  const hasGaCommittee = includesAny(preferences, [
    'ga',
    'general assembly',
    'unep',
    'who',
    'women',
    'specpol',
    'french',
    'fransiz',
    'parliament',
    'meclisi',
  ])
  const hasCrisisCommittee = includesAny(preferences, [
    'mkk',
    'fcc',
    'crisis',
    'seven years',
    'league of legends',
    'lol',
  ])
  const hasNonCrisisCommittee = includesAny(preferences, [
    'unep',
    'interpol',
    'who',
    'women',
    'specpol',
    'special ga',
    'general assembly',
  ])
  const onlyCrisis = hasCrisisCommittee && !hasNonCrisisCommittee
  const requiredFields: Record<string, string> = {}

  if (onlyCrisis) {
    requiredFields.directiveProcedure =
      'This field is required when you apply only for crisis committees.'
    requiredFields.montcalmDirective =
      'This field is required when you apply only for crisis committees.'
  }
  if (hasFcc) {
    requiredFields.lolKnowledge =
      'This field is required when you apply for FCC.'
  }
  if (hasSpecialGa) {
    requiredFields.specialGaSeries =
      'This field is required when you apply for Special GA.'
  }
  if (hasGaCommittee) {
    requiredFields.gaProcedure =
      'This field is required when you apply for General Assembly committees.'
    requiredFields.supportDelegateScenario =
      'This field is required when you apply for General Assembly committees.'
  }

  return requiredFields
}

function getExperienceValue(values: ApplicationValues) {
  const candidates = [
    values.experienceList,
    values.previousMunExperiences,
    values.delegationRole,
  ]
  const firstValue = candidates.find(
    (value) => typeof value === 'string' && value.trim(),
  )

  return typeof firstValue === 'string' ? firstValue : 'Not provided'
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
  const optionalFieldIds = optionalRoleFieldIds[role]
  const requiredFieldSet = new Set<string>(requiredFieldIds)
  const values: ApplicationValues = { role }

  for (const fieldId of [...requiredFieldIds, ...optionalFieldIds]) {
    const value = formatFieldValue(fieldId, getString(valuesSource, fieldId))
    values[fieldId] = value

    if (requiredFieldSet.has(fieldId) && !value) {
      fields[fieldId] = 'This field is required.'
    } else if (value.length > maxFieldLength) {
      fields[fieldId] = `Use ${maxFieldLength} characters or fewer.`
    }
  }

  const email = String(values.email ?? '')
  if (email && !emailPattern.test(email)) {
    fields.email = 'Enter a valid email address.'
  }

  const dateOfBirth = String(values.dateOfBirth ?? '')
  if (dateOfBirth && !isValidDateOfBirth(dateOfBirth)) {
    fields.dateOfBirth = 'Enter date as DD/MM/YYYY.'
  }

  const phone = String(values.phone ?? '')
  if (phone && !isValidPhoneNumber(phone)) {
    fields.phone =
      'Enter a 10-digit phone number without 0, e.g. 5XX XXX XX XX.'
  }

  for (const fieldId of ['chairboardMotivation', 'motivationLetter']) {
    const value = String(values[fieldId] ?? '')
    if (value && countWords(value) < 150) {
      fields[fieldId] = 'Write at least 150 words.'
    }
  }

  if (role === 'Chairboard') {
    const conditionalRequiredFields =
      getConditionalChairboardRequiredFields(values)
    for (const [fieldId, message] of Object.entries(
      conditionalRequiredFields,
    )) {
      if (!String(values[fieldId] ?? '').trim()) {
        fields[fieldId] = message
      }
    }
  }

  values.city = 'Not provided'
  values.experience = getExperienceValue(values)
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
