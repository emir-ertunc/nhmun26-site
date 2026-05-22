import {
  ArrowLeft,
  ClipboardList,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button, ButtonLink } from './components/Button'
import { ParchmentCard } from './components/ParchmentCard'
import {
  type AdminApplicationDetail,
  type AdminApplicationSummary,
  getAdminApplication,
  getAdminApplications,
  getAdminMe,
  updateAdminApplication,
} from './lib/adminApi'
import { cn } from './lib/cn'

const statuses = ['new', 'reviewing', 'accepted', 'waitlisted', 'rejected']
const roles = ['Delegate', 'Delegation', 'Chair', 'Press', 'Organization Team']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getPayloadEntries(application: AdminApplicationDetail | null) {
  if (!application) {
    return []
  }

  try {
    const parsed = JSON.parse(application.payload_json) as {
      values?: Record<string, unknown>
    }
    return Object.entries(parsed.values ?? {}).filter(
      ([key]) => !['consentContact', 'consentTerms', 'role'].includes(key),
    )
  } catch {
    return []
  }
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]',
        status === 'accepted' && 'border-burgundy bg-burgundy text-cream',
        status === 'rejected' && 'border-ink/20 bg-ink/70 text-cream',
        status === 'waitlisted' && 'border-gold bg-gold text-ink',
        status === 'reviewing' &&
          'border-burgundy/20 bg-parchment/68 text-burgundy',
        status === 'new' && 'border-burgundy/15 bg-cream/80 text-burgundy',
      )}
    >
      {status}
    </span>
  )
}

function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode
  email?: string
}) {
  return (
    <main className="min-h-screen bg-parchment px-5 py-6 text-ink md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-burgundy/20 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <ButtonLink
              className="min-h-10 px-4 py-2"
              href="/"
              variant="secondary"
            >
              <ArrowLeft aria-hidden className="mr-2" size={18} />
              Site
            </ButtonLink>
            <h1 className="mt-5 font-serif text-5xl font-bold text-burgundy-dark">
              Admin Panel
            </h1>
          </div>
          {email && (
            <div className="flex items-center gap-3 rounded-lg border border-burgundy/15 bg-cream/72 px-4 py-3 text-sm font-bold text-burgundy">
              <ShieldCheck aria-hidden size={18} />
              {email}
            </div>
          )}
        </header>
        {children}
      </div>
    </main>
  )
}

function AdminError({ message }: { message: string }) {
  return (
    <AdminShell>
      <ParchmentCard className="mt-8">
        <ShieldCheck aria-hidden className="text-burgundy" size={36} />
        <h2 className="mt-4 font-serif text-3xl font-bold text-burgundy-dark">
          Admin access required
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-ink/72">{message}</p>
        <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-ink/64">
          On production, protect `/admin` and `/api/admin/*` with Cloudflare
          Access and add your email to `ADMIN_EMAIL_ALLOWLIST`.
        </p>
      </ParchmentCard>
    </AdminShell>
  )
}

export function AdminApp() {
  const [adminEmail, setAdminEmail] = useState('')
  const [applications, setApplications] = useState<AdminApplicationSummary[]>(
    [],
  )
  const [selectedApplication, setSelectedApplication] =
    useState<AdminApplicationDetail | null>(null)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [reviewStatus, setReviewStatus] = useState('new')
  const [reviewScore, setReviewScore] = useState('')
  const [reviewerNotes, setReviewerNotes] = useState('')

  const payloadEntries = useMemo(
    () => getPayloadEntries(selectedApplication),
    [selectedApplication],
  )

  const loadApplications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const me = await getAdminMe()
      setAdminEmail(me.email)
      const response = await getAdminApplications({ query, role, status })
      setApplications(response.applications)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Admin panel could not load.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const selectApplication = async (application: AdminApplicationSummary) => {
    setError(null)
    try {
      const response = await getAdminApplication(application.id)
      setSelectedApplication(response.application)
      setReviewStatus(response.application.status)
      setReviewScore(
        response.application.review_score === null
          ? ''
          : String(response.application.review_score),
      )
      setReviewerNotes(response.application.reviewer_notes ?? '')
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : 'Application could not be loaded.',
      )
    }
  }

  const saveReview = async () => {
    if (!selectedApplication) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await updateAdminApplication(selectedApplication.id, {
        reviewerNotes,
        reviewScore: reviewScore ? Number(reviewScore) : null,
        status: reviewStatus,
      })
      setSelectedApplication(response.application)
      await loadApplications()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Application review could not be saved.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadApplications()
    }, 0)

    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error && !adminEmail && applications.length === 0) {
    return <AdminError message={error} />
  }

  return (
    <AdminShell email={adminEmail}>
      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-5">
          <ParchmentCard>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <label className="relative block">
                <Search
                  aria-hidden
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-burgundy"
                  size={18}
                />
                <input
                  className="w-full rounded-lg border border-burgundy/20 bg-cream/82 py-3 pl-10 pr-4 font-semibold text-ink outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email, school, city"
                  value={query}
                />
              </label>
              <select
                className="rounded-lg border border-burgundy/20 bg-cream/82 px-4 py-3 font-semibold text-ink outline-none"
                onChange={(event) => setRole(event.target.value)}
                value={role}
              >
                <option value="all">All roles</option>
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-burgundy/20 bg-cream/82 px-4 py-3 font-semibold text-ink outline-none"
                onChange={(event) => setStatus(event.target.value)}
                value={status}
              >
                <option value="all">All statuses</option>
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={loadApplications} type="button">
                <RefreshCw aria-hidden className="mr-2" size={18} />
                Refresh
              </Button>
            </div>
            {error && (
              <p className="mt-4 rounded-lg border border-burgundy/20 bg-burgundy/8 px-4 py-3 text-sm font-semibold text-burgundy">
                {error}
              </p>
            )}
          </ParchmentCard>

          <div className="grid gap-3">
            {isLoading ? (
              <ParchmentCard>Loading applications...</ParchmentCard>
            ) : applications.length === 0 ? (
              <ParchmentCard>No applications found.</ParchmentCard>
            ) : (
              applications.map((application) => (
                <button
                  className="rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
                  key={application.id}
                  onClick={() => selectApplication(application)}
                  type="button"
                >
                  <ParchmentCard
                    className={cn(
                      'transition hover:bg-cream',
                      selectedApplication?.id === application.id &&
                        'border-burgundy bg-cream',
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-burgundy-dark">
                          {application.full_name}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-ink/70">
                          {application.email}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    <div className="mt-4 grid gap-2 text-sm font-semibold text-ink/70 sm:grid-cols-2">
                      <span>{application.role}</span>
                      <span>{application.school}</span>
                      <span>{application.city}</span>
                      <span>{formatDate(application.created_at)}</span>
                    </div>
                  </ParchmentCard>
                </button>
              ))
            )}
          </div>
        </div>

        <ParchmentCard className="min-h-96">
          {selectedApplication ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-burgundy">
                    Application detail
                  </p>
                  <h2 className="mt-3 font-serif text-4xl font-bold text-burgundy-dark">
                    {selectedApplication.full_name}
                  </h2>
                  <p className="mt-2 font-semibold text-ink/70">
                    {selectedApplication.email}
                  </p>
                </div>
                <StatusBadge status={selectedApplication.status} />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ['Role', selectedApplication.role],
                  ['Phone', selectedApplication.phone],
                  ['School', selectedApplication.school],
                  ['Grade', selectedApplication.grade],
                  ['City', selectedApplication.city],
                  ['Submitted', formatDate(selectedApplication.created_at)],
                ].map(([label, value]) => (
                  <div
                    className="rounded-lg border border-burgundy/15 bg-parchment/35 p-4"
                    key={label}
                  >
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-burgundy">
                      {label}
                    </p>
                    <p className="mt-1 font-semibold text-ink/78">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3">
                {payloadEntries.map(([key, value]) => (
                  <div
                    className="rounded-lg border border-burgundy/15 bg-cream/62 p-4"
                    key={key}
                  >
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-burgundy">
                      {key}
                    </p>
                    <p className="mt-1 whitespace-pre-line leading-6 text-ink/78">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 border-t border-burgundy/15 pt-6">
                <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-burgundy">
                  Review
                </p>
                <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                  <select
                    className="rounded-lg border border-burgundy/20 bg-cream/82 px-4 py-3 font-semibold text-ink outline-none"
                    onChange={(event) => setReviewStatus(event.target.value)}
                    value={reviewStatus}
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded-lg border border-burgundy/20 bg-cream/82 px-4 py-3 font-semibold text-ink outline-none"
                    max={100}
                    min={0}
                    onChange={(event) => setReviewScore(event.target.value)}
                    placeholder="Score"
                    type="number"
                    value={reviewScore}
                  />
                </div>
                <textarea
                  className="min-h-40 rounded-lg border border-burgundy/20 bg-cream/82 px-4 py-3 font-semibold leading-7 text-ink outline-none"
                  onChange={(event) => setReviewerNotes(event.target.value)}
                  placeholder="Reviewer notes"
                  value={reviewerNotes}
                />
                <Button disabled={isSaving} onClick={saveReview} type="button">
                  <Save aria-hidden className="mr-2" size={18} />
                  {isSaving ? 'Saving...' : 'Save Review'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <ClipboardList aria-hidden className="text-burgundy" size={42} />
              <h2 className="mt-4 font-serif text-3xl font-bold text-burgundy-dark">
                Select an application
              </h2>
              <p className="mt-3 max-w-md leading-7 text-ink/70">
                Choose an application from the list to review details, update
                status, add notes, and assign a score.
              </p>
            </div>
          )}
        </ParchmentCard>
      </section>
    </AdminShell>
  )
}
