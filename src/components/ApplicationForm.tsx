import { CheckCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  type ApplicationField,
  type ApplicationRole,
  applicationRoles,
  personalFields,
  roleFields,
} from '../data/application'
import {
  ApplicationSubmitError,
  submitApplicationForm,
} from '../lib/applicationApi'
import { cn } from '../lib/cn'
import { Button } from './Button'
import { ParchmentCard } from './ParchmentCard'
import { TurnstileWidget } from './TurnstileWidget'

type FormValues = Record<string, string | boolean>

const steps = ['Role', 'Personal Info', 'Role Details', 'Review'] as const

const initialValues: FormValues = {
  role: 'Delegate',
  consentContact: false,
  consentTerms: false,
}

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

function getFieldValue(values: FormValues, id: string) {
  const value = values[id]
  return typeof value === 'string' ? value : ''
}

function getRole(values: FormValues) {
  return values.role as ApplicationRole
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function needsMinimumWords(fieldId: string) {
  return ['chairboardMotivation', 'motivationLetter'].includes(fieldId)
}

function normalizePreferenceValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
}

function includesAny(value: string, terms: readonly string[]) {
  const normalizedValue = normalizePreferenceValue(value)
  return terms.some((term) => normalizedValue.includes(term))
}

function getConditionalChairboardRequiredFields(values: FormValues) {
  const preferences = getFieldValue(values, 'preferredCommittees')
  const hasFcc = includesAny(preferences, ['fcc', 'league of legends', 'lol'])
  const hasSpecialGa = includesAny(preferences, ['special ga'])
  const hasGaCommittee = includesAny(preferences, [
    'ga',
    'general assembly',
    'unep',
    'who',
    'women',
    'specpol',
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
    'tbmm',
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

function FieldControl({
  error,
  field,
  onChange,
  value,
}: {
  error?: string
  field: ApplicationField
  onChange: (id: string, value: string) => void
  value: string
}) {
  const inputClassName = cn(
    'mt-2 w-full rounded-lg border bg-cream/82 px-4 py-3 text-base font-semibold text-ink outline-none transition placeholder:text-ink/38 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20',
    error ? 'border-burgundy' : 'border-burgundy/20',
  )
  const isLongLabel = field.label.length > 80

  return (
    <label className="block">
      <span
        className={cn(
          'text-sm font-extrabold text-burgundy',
          isLongLabel ? 'leading-6' : 'uppercase tracking-[0.18em]',
        )}
      >
        {field.label}
      </span>
      {field.multiline ? (
        <textarea
          className={cn(inputClassName, 'min-h-32 resize-y leading-7')}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          value={value}
        />
      ) : (
        <input
          className={inputClassName}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          type={field.id.toLowerCase().includes('email') ? 'email' : 'text'}
          value={value}
        />
      )}
      {field.help && <p className="mt-2 text-sm text-ink/62">{field.help}</p>}
      {error && (
        <p className="mt-2 text-sm font-semibold text-burgundy">{error}</p>
      )}
    </label>
  )
}

export function ApplicationForm() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const selectedRole = getRole(values)
  const selectedRoleFields: readonly ApplicationField[] =
    roleFields[selectedRole]
  const selectedRoleFieldIds = useMemo(
    () => new Set<string>(selectedRoleFields.map((field) => field.id)),
    [selectedRoleFields],
  )
  const personalFieldIds = useMemo(
    () => new Set<string>(personalFields.map((field) => field.id)),
    [],
  )

  const reviewItems = useMemo(() => {
    const fields = [...personalFields, ...selectedRoleFields]
    return fields.map((field) => ({
      label: field.label,
      value: getFieldValue(values, field.id) || 'Not provided',
    }))
  }, [selectedRoleFields, values])

  const updateValue = (id: string, value: string | boolean) => {
    setValues((current) => ({ ...current, [id]: value }))
    setSubmitError(null)
    setErrors((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const validateStep = (targetStep = stepIndex) => {
    const nextErrors: Record<string, string> = {}

    if (targetStep === 0 && !values.role) {
      nextErrors.role = 'Select an application role.'
    }

    if (targetStep === 1) {
      for (const field of personalFields) {
        const value = getFieldValue(values, field.id).trim()
        if (field.required && !value) {
          nextErrors[field.id] = 'This field is required.'
        }
      }

      const email = getFieldValue(values, 'email').trim()
      if (email && !isEmail(email)) {
        nextErrors.email = 'Enter a valid email address.'
      }
    }

    if (targetStep === 2) {
      for (const field of selectedRoleFields) {
        const value = getFieldValue(values, field.id).trim()
        if (field.required && !value) {
          nextErrors[field.id] = 'This field is required.'
        } else if (needsMinimumWords(field.id) && countWords(value) < 150) {
          nextErrors[field.id] = 'Write at least 150 words.'
        }
      }

      if (selectedRole === 'Chairboard') {
        const conditionalRequiredFields =
          getConditionalChairboardRequiredFields(values)
        for (const [fieldId, message] of Object.entries(
          conditionalRequiredFields,
        )) {
          if (!getFieldValue(values, fieldId).trim()) {
            nextErrors[fieldId] = message
          }
        }
      }
    }

    if (targetStep === 3) {
      if (!values.consentTerms) {
        nextErrors.consentTerms = 'You must confirm the application statement.'
      }
      if (!values.consentContact) {
        nextErrors.consentContact = 'You must allow NHMUN26 to contact you.'
      }
      if (turnstileSiteKey && !turnstileToken) {
        nextErrors.turnstile = 'Complete the security check.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const goNext = () => {
    if (!validateStep()) {
      return
    }
    setStepIndex((current) => Math.min(current + 1, steps.length - 1))
  }

  const goBack = () => {
    setErrors({})
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  const applyServerErrors = (fieldErrors: Record<string, string>) => {
    setErrors(fieldErrors)

    const fieldIds = Object.keys(fieldErrors)
    if (fieldIds.includes('role')) {
      setStepIndex(0)
      return
    }
    if (fieldIds.some((fieldId) => personalFieldIds.has(fieldId))) {
      setStepIndex(1)
      return
    }
    if (fieldIds.some((fieldId) => selectedRoleFieldIds.has(fieldId))) {
      setStepIndex(2)
      return
    }
    setStepIndex(3)
  }

  const submitApplication = async () => {
    if (!validateStep(3)) {
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const response = await submitApplicationForm(
        selectedRole,
        values,
        turnstileToken ?? undefined,
      )
      setSubmittedId(response.applicationId)
      setSubmitted(true)
    } catch (error) {
      if (error instanceof ApplicationSubmitError) {
        setSubmitError(error.message)
        if (error.fields) {
          applyServerErrors(error.fields)
        }
        if (error.fields?.turnstile) {
          setTurnstileToken(null)
          setTurnstileResetKey((current) => current + 1)
        }
      } else {
        setSubmitError('Application could not be submitted. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <ParchmentCard className="bg-cream/90">
        <CheckCircle2 aria-hidden className="text-burgundy" size={42} />
        <h3 className="mt-5 font-serif text-4xl font-bold text-burgundy-dark">
          Application received
        </h3>
        <p className="mt-4 leading-7 text-ink/72">
          Your application has been recorded. Keep this reference ID for any
          follow-up with the NHMUN26 team.
        </p>
        {submittedId && (
          <p className="mt-4 rounded-lg border border-burgundy/15 bg-parchment/50 px-4 py-3 font-mono text-sm font-bold text-burgundy-dark">
            {submittedId}
          </p>
        )}
        <Button
          className="mt-6"
          onClick={() => {
            setSubmitted(false)
            setSubmittedId(null)
            setStepIndex(0)
            setValues(initialValues)
            setErrors({})
            setSubmitError(null)
            setTurnstileToken(null)
            setTurnstileResetKey((current) => current + 1)
          }}
          type="button"
        >
          Start Another
        </Button>
      </ParchmentCard>
    )
  }

  return (
    <ParchmentCard className="bg-cream/90">
      <div className="grid gap-3 sm:grid-cols-4">
        {steps.map((step, index) => (
          <div
            className={cn(
              'rounded-lg border px-3 py-2 text-center text-xs font-extrabold uppercase tracking-[0.14em]',
              index === stepIndex
                ? 'border-burgundy bg-burgundy text-cream'
                : 'border-burgundy/15 bg-parchment/42 text-burgundy',
            )}
            key={step}
          >
            {step}
          </div>
        ))}
      </div>

      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault()
          submitApplication()
        }}
      >
        {stepIndex === 0 && (
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-burgundy">
              Choose your role
            </p>
            <div className="mt-5 grid gap-3">
              {applicationRoles.map((item) => (
                <label
                  className={cn(
                    'block cursor-pointer rounded-lg border p-4 transition',
                    selectedRole === item.role
                      ? 'border-burgundy bg-parchment/68'
                      : 'border-burgundy/15 bg-cream/50 hover:bg-parchment/35',
                  )}
                  key={item.role}
                >
                  <input
                    checked={selectedRole === item.role}
                    className="sr-only"
                    name="role"
                    onChange={() => updateValue('role', item.role)}
                    type="radio"
                    value={item.role}
                  />
                  <span className="font-serif text-2xl font-bold text-burgundy-dark">
                    {item.role}
                  </span>
                  <span className="mt-2 block leading-6 text-ink/70">
                    {item.description}
                  </span>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="mt-3 text-sm font-semibold text-burgundy">
                {errors.role}
              </p>
            )}
          </div>
        )}

        {stepIndex === 1 && (
          <div className="grid gap-5">
            {personalFields.map((field) => (
              <FieldControl
                error={errors[field.id]}
                field={field}
                key={field.id}
                onChange={updateValue}
                value={getFieldValue(values, field.id)}
              />
            ))}
          </div>
        )}

        {stepIndex === 2 && (
          <div className="grid gap-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-burgundy">
              {selectedRole} details
            </p>
            {selectedRoleFields.map((field) => (
              <FieldControl
                error={errors[field.id]}
                field={field}
                key={field.id}
                onChange={updateValue}
                value={getFieldValue(values, field.id)}
              />
            ))}
          </div>
        )}

        {stepIndex === 3 && (
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-burgundy">
              Review application
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-lg border border-burgundy/15 bg-parchment/42 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-burgundy">
                  Role
                </p>
                <p className="mt-1 font-serif text-2xl font-bold text-burgundy-dark">
                  {selectedRole}
                </p>
              </div>
              {reviewItems.map((item) => (
                <div
                  className="rounded-lg border border-burgundy/15 bg-cream/62 p-4"
                  key={item.label}
                >
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-burgundy">
                    {item.label}
                  </p>
                  <p className="mt-1 whitespace-pre-line leading-6 text-ink/78">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3">
              <label className="flex gap-3 rounded-lg border border-burgundy/15 bg-parchment/35 p-4">
                <input
                  checked={Boolean(values.consentTerms)}
                  className="mt-1 size-4 accent-burgundy"
                  onChange={(event) =>
                    updateValue('consentTerms', event.target.checked)
                  }
                  type="checkbox"
                />
                <span className="leading-6 text-ink/74">
                  I confirm that the information in this application is correct.
                  {errors.consentTerms && (
                    <strong className="mt-1 block text-burgundy">
                      {errors.consentTerms}
                    </strong>
                  )}
                </span>
              </label>
              <label className="flex gap-3 rounded-lg border border-burgundy/15 bg-parchment/35 p-4">
                <input
                  checked={Boolean(values.consentContact)}
                  className="mt-1 size-4 accent-burgundy"
                  onChange={(event) =>
                    updateValue('consentContact', event.target.checked)
                  }
                  type="checkbox"
                />
                <span className="leading-6 text-ink/74">
                  I allow NHMUN26 to contact me about this application.
                  {errors.consentContact && (
                    <strong className="mt-1 block text-burgundy">
                      {errors.consentContact}
                    </strong>
                  )}
                </span>
              </label>
              {turnstileSiteKey ? (
                <TurnstileWidget
                  error={errors.turnstile}
                  key={turnstileResetKey}
                  onError={() => {
                    setTurnstileToken(null)
                    setErrors((current) => ({
                      ...current,
                      turnstile: 'Complete the security check.',
                    }))
                  }}
                  onExpire={() => {
                    setTurnstileToken(null)
                    setErrors((current) => ({
                      ...current,
                      turnstile: 'Security check expired. Complete it again.',
                    }))
                  }}
                  onVerify={(token) => {
                    setTurnstileToken(token)
                    setErrors((current) => {
                      const next = { ...current }
                      delete next.turnstile
                      return next
                    })
                    setSubmitError(null)
                  }}
                  siteKey={turnstileSiteKey}
                />
              ) : (
                <div className="rounded-lg border border-burgundy/15 bg-parchment/35 p-4 text-sm font-semibold text-ink/64">
                  Security check is disabled in this local preview.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <Button
            disabled={stepIndex === 0 || isSubmitting}
            onClick={goBack}
            type="button"
            variant="secondary"
          >
            Back
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button disabled={isSubmitting} onClick={goNext} type="button">
              Continue
            </Button>
          ) : (
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
        {submitError && (
          <p
            className="mt-4 rounded-lg border border-burgundy/20 bg-burgundy/8 px-4 py-3 text-sm font-semibold text-burgundy"
            role="alert"
          >
            {submitError}
          </p>
        )}
      </form>
    </ParchmentCard>
  )
}
