import { CheckCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  type ApplicationField,
  type ApplicationRole,
  applicationRoles,
  personalFields,
  roleFields,
} from '../data/application'
import { cn } from '../lib/cn'
import { Button } from './Button'
import { ParchmentCard } from './ParchmentCard'

type FormValues = Record<string, string | boolean>

const steps = ['Role', 'Personal Info', 'Role Details', 'Review'] as const

const initialValues: FormValues = {
  role: 'Delegate',
  consentContact: false,
  consentTerms: false,
}

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

  return (
    <label className="block">
      <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-burgundy">
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
  const [submitted, setSubmitted] = useState(false)

  const selectedRole = getRole(values)
  const selectedRoleFields = roleFields[selectedRole]

  const reviewItems = useMemo(() => {
    const fields = [...personalFields, ...selectedRoleFields]
    return fields.map((field) => ({
      label: field.label,
      value: getFieldValue(values, field.id) || 'Not provided',
    }))
  }, [selectedRoleFields, values])

  const updateValue = (id: string, value: string | boolean) => {
    setValues((current) => ({ ...current, [id]: value }))
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
        }
      }

      const advisorEmail = getFieldValue(values, 'advisorEmail').trim()
      if (advisorEmail && !isEmail(advisorEmail)) {
        nextErrors.advisorEmail = 'Enter a valid advisor email address.'
      }
    }

    if (targetStep === 3) {
      if (!values.consentTerms) {
        nextErrors.consentTerms = 'You must confirm the application statement.'
      }
      if (!values.consentContact) {
        nextErrors.consentContact = 'You must allow NHMUN26 to contact you.'
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

  const submitApplication = () => {
    if (!validateStep(3)) {
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <ParchmentCard className="bg-cream/90">
        <CheckCircle2 aria-hidden className="text-burgundy" size={42} />
        <h3 className="mt-5 font-serif text-4xl font-bold text-burgundy-dark">
          Application received
        </h3>
        <p className="mt-4 leading-7 text-ink/72">
          This is the Phase 6 frontend success state. The real database and API
          submission flow will be connected in Phase 7.
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            setSubmitted(false)
            setStepIndex(0)
            setValues(initialValues)
            setErrors({})
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
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <Button
            disabled={stepIndex === 0}
            onClick={goBack}
            type="button"
            variant="secondary"
          >
            Back
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button onClick={goNext} type="button">
              Continue
            </Button>
          ) : (
            <Button type="submit">Submit Application</Button>
          )}
        </div>
      </form>
    </ParchmentCard>
  )
}
