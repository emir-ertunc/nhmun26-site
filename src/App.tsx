import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  Compass,
  Gauge,
  Landmark,
  Languages,
  Megaphone,
  MapPin,
  Menu,
  PenLine,
  ScrollText,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AdminApp } from './AdminApp'
import { nhmunImages } from './assets/nhmun'
import { ApplicationForm } from './components/ApplicationForm'
import { Button, ButtonLink } from './components/Button'
import { DecorativeFrame } from './components/DecorativeFrame'
import { Modal } from './components/Modal'
import { ParchmentCard } from './components/ParchmentCard'
import { Section } from './components/Section'
import type { Committee, CommitteeCategory } from './data/committees'
import { committeeFilters, committees } from './data/committees'
import {
  aboutHighlights,
  aboutPillars,
  conference,
  conferenceRhythm,
  navigationItems,
} from './data/conference'
import { teamDepartments, teamMembers } from './data/team'
import { cn } from './lib/cn'

const countdownLabels = {
  days: 'Days',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
} as const

const navigationSectionIds = navigationItems.map((item) => item.id)

const aboutHighlightIcons = [Clock3, BookOpen, MapPin, Landmark] as const
const aboutPillarIcons = [ScrollText, Compass, UsersRound] as const
const teamDepartmentIcons = {
  Academic: BookOpen,
  Organization: ShieldCheck,
  Press: Megaphone,
  Secretariat: Landmark,
} as const
const teamSummaryIcons = [Landmark, BookOpen, ShieldCheck, PenLine] as const

function getCountdownParts(targetDate: Date) {
  const total = Math.max(0, targetDate.getTime() - Date.now())
  const seconds = Math.floor(total / 1000)

  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  }
}

function useCountdown(targetIso: string) {
  const targetDate = useMemo(() => new Date(targetIso), [targetIso])
  const [remaining, setRemaining] = useState(() =>
    getCountdownParts(targetDate),
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(getCountdownParts(targetDate))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [targetDate])

  return remaining
}

function useActiveSection(sectionIds: readonly string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id)
        }
      },
      { rootMargin: '-24% 0px -58% 0px', threshold: [0.12, 0.24, 0.4] },
    )

    for (const id of sectionIds) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => observer.disconnect()
  }, [sectionIds])

  return activeSection
}

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const activeSection = useActiveSection(navigationSectionIds)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-cream/25 bg-cedar/82 text-cream shadow-soft backdrop-blur-md">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-8"
      >
        <a
          className="font-serif text-2xl font-bold tracking-[0.12em] text-cream"
          href="#home"
          onClick={closeMenu}
        >
          NHMUN <span className="text-gold">26</span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <a
              className={cn(
                'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition',
                activeSection === item.id
                  ? 'bg-cream text-burgundy'
                  : 'text-cream/78 hover:bg-cream/10 hover:text-cream',
              )}
              href={item.href}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </div>

        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="inline-flex size-11 items-center justify-center rounded-full border border-cream/35 text-cream lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          {isOpen ? (
            <X aria-hidden size={20} />
          ) : (
            <Menu aria-hidden size={20} />
          )}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-cream/20 bg-cedar px-5 py-4 lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-2">
            {navigationItems.map((item) => (
              <a
                className={cn(
                  'rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-[0.14em]',
                  activeSection === item.id
                    ? 'bg-cream text-burgundy'
                    : 'text-cream/85',
                )}
                href={item.href}
                key={item.id}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

function Countdown() {
  const remaining = useCountdown(conference.startsAt)

  return (
    <div aria-label="Conference countdown" className="grid grid-cols-4 gap-2">
      {Object.entries(remaining).map(([key, value]) => (
        <div
          className="min-w-0 rounded-lg border border-burgundy/15 bg-cream/80 px-3 py-4 text-center shadow-parchment"
          key={key}
        >
          <div className="font-serif text-3xl font-bold leading-none text-burgundy-dark md:text-5xl">
            {String(value).padStart(2, '0')}
          </div>
          <div className="mt-2 truncate text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-burgundy">
            {countdownLabels[key as keyof typeof countdownLabels]}
          </div>
        </div>
      ))}
    </div>
  )
}

function Hero() {
  return (
    <section
      className="relative isolate min-h-svh overflow-hidden bg-cover bg-center px-5 pt-32 text-cream md:px-8"
      id="home"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(32, 19, 13, 0.88), rgba(79, 21, 18, 0.6) 48%, rgba(32, 19, 13, 0.42)), url(${nhmunImages.main.webp})`,
      }}
    >
      <div className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-6xl items-center gap-10 pb-16 lg:grid-cols-[1fr_0.82fr]">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-extrabold uppercase tracking-[0.32em] text-gold">
            Model United Nations Conference
          </p>
          <h1 className="text-balance font-serif text-6xl font-bold leading-[0.9] md:text-8xl">
            {conference.name}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-cream/82 md:text-2xl">
            {conference.tagline}
          </p>

          <div className="mt-8 grid gap-4 text-sm font-semibold text-cream/86 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarDays aria-hidden className="shrink-0 text-gold" />
              <span>{conference.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin aria-hidden className="shrink-0 text-gold" />
              <span>{conference.location}</span>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="#apply">Apply Now</ButtonLink>
            <ButtonLink href="#committees" variant="secondary">
              Explore Committees
            </ButtonLink>
          </div>
        </div>

        <div className="w-full max-w-xl justify-self-center lg:justify-self-end">
          <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-[0.24em] text-gold">
            Conference begins in
          </p>
          <Countdown />
        </div>
      </div>

      <a
        aria-label="Scroll to About Us"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 rounded-full border border-cream/35 p-3 text-cream/85 transition hover:bg-cream/10 md:inline-flex"
        href="#about"
      >
        <ChevronDown aria-hidden size={22} />
      </a>
    </section>
  )
}

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  body: string
  eyebrow: string
  title: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-extrabold uppercase tracking-[0.26em] text-burgundy">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance font-serif text-4xl font-bold text-burgundy-dark md:text-6xl">
        {title}
      </h2>
      <p className="mt-5 text-lg leading-8 text-ink/74">{body}</p>
    </div>
  )
}

function AboutSection() {
  return (
    <Section background={nhmunImages.about} id="about">
      <div className="grid items-start gap-12 lg:grid-cols-[0.98fr_1.02fr]">
        <div>
          <SectionIntro
            body="NHMUN'26 is a three-day academic diplomacy experience in Izmir, built for delegates who want structured debate, clear procedure, and a conference atmosphere shaped by local heritage."
            eyebrow="About Us"
            title="A focused conference for young diplomats."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {aboutHighlights.map((item, index) => {
              const Icon = aboutHighlightIcons[index]

              return (
                <ParchmentCard className="min-h-48" key={item.label}>
                  <Icon aria-hidden className="text-burgundy" size={28} />
                  <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.22em] text-burgundy">
                    {item.label}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-burgundy-dark">
                    {item.value}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-ink/70">
                    {item.description}
                  </p>
                </ParchmentCard>
              )
            })}
          </div>
        </div>

        <div className="grid gap-6">
          <DecorativeFrame className="bg-cream/35">
            <div className="rounded-lg bg-cream/82 p-6 md:p-8">
              <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-burgundy">
                Conference Identity
              </p>
              <h3 className="mt-4 font-serif text-4xl font-bold leading-tight text-burgundy-dark">
                Debate with structure, presence, and a sense of place.
              </h3>
              <p className="mt-5 leading-7 text-ink/74">
                NHMUN26 is not planned as a generic template site or a rotating
                event platform. The experience, visuals, and application flow
                are tailored to this specific conference: a warm, formal,
                parchment-led identity for an academic MUN in Izmir Konak.
              </p>
            </div>
          </DecorativeFrame>

          <div className="grid gap-4">
            {aboutPillars.map((pillar, index) => {
              const Icon = aboutPillarIcons[index]

              return (
                <div
                  className="grid gap-4 rounded-lg border border-burgundy/18 bg-cream/72 p-5 shadow-parchment sm:grid-cols-[auto_1fr]"
                  key={pillar.title}
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-burgundy text-cream">
                    <Icon aria-hidden size={22} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-burgundy-dark">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 leading-7 text-ink/72">{pillar.body}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <ParchmentCard>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-burgundy">
              Three-day rhythm
            </p>
            <ol className="mt-5 grid gap-3">
              {conferenceRhythm.map((item, index) => (
                <li className="flex gap-4" key={item}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-burgundy font-serif text-sm font-bold text-cream">
                    {index + 1}
                  </span>
                  <span className="pt-1 font-semibold text-ink/78">{item}</span>
                </li>
              ))}
            </ol>
          </ParchmentCard>
        </div>
      </div>
    </Section>
  )
}

function CommitteeDetail({ committee }: { committee: Committee }) {
  return (
    <div className="grid gap-6">
      <p className="text-lg leading-8 text-ink/74">{committee.description}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-burgundy/15 bg-parchment/45 p-4">
          <div className="flex items-center gap-2 text-burgundy">
            <Gauge aria-hidden size={18} />
            <p className="text-xs font-extrabold uppercase tracking-[0.18em]">
              Difficulty
            </p>
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-burgundy-dark">
            {committee.difficulty}
          </p>
        </div>
        <div className="rounded-lg border border-burgundy/15 bg-parchment/45 p-4">
          <div className="flex items-center gap-2 text-burgundy">
            <UsersRound aria-hidden size={18} />
            <p className="text-xs font-extrabold uppercase tracking-[0.18em]">
              Capacity
            </p>
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-burgundy-dark">
            {committee.capacity}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-burgundy">
          Agenda
        </p>
        <p className="mt-2 text-lg font-semibold leading-7 text-ink/82">
          {committee.agenda}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-burgundy">
            Chairs
          </p>
          <p className="mt-2 font-semibold text-ink/78">
            {committee.chairs.join(', ')}
          </p>
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-burgundy">
            Language
          </p>
          <p className="mt-2 font-semibold text-ink/78">{committee.language}</p>
        </div>
      </div>

      {committee.studyGuideUrl && (
        <ButtonLink
          className="w-fit"
          href={committee.studyGuideUrl}
          rel="noreferrer"
          target="_blank"
        >
          Study Guide
        </ButtonLink>
      )}
    </div>
  )
}

function CommitteeCard({
  committee,
  onSelect,
}: {
  committee: Committee
  onSelect: (committee: Committee) => void
}) {
  return (
    <button
      className="group h-full rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
      onClick={() => onSelect(committee)}
      type="button"
    >
      <ParchmentCard className="flex h-full flex-col transition duration-200 group-hover:-translate-y-1 group-hover:bg-cream">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-burgundy">
              {committee.category}
            </p>
            <h3 className="mt-3 font-serif text-3xl font-bold leading-tight text-burgundy-dark">
              {committee.shortName}
            </h3>
          </div>
          <span className="rounded-full border border-burgundy/20 px-3 py-1 text-xs font-bold text-burgundy">
            {committee.difficulty}
          </span>
        </div>

        <p className="mt-5 line-clamp-4 leading-7 text-ink/72">
          {committee.agenda}
        </p>

        <div className="mt-auto grid gap-3 pt-7 text-sm font-semibold text-ink/70">
          <span className="flex items-center gap-2">
            <UsersRound aria-hidden className="text-burgundy" size={18} />
            {committee.capacity}
          </span>
          <span className="flex items-center gap-2">
            <Languages aria-hidden className="text-burgundy" size={18} />
            {committee.language}
          </span>
        </div>
      </ParchmentCard>
    </button>
  )
}

function CommitteesSection() {
  const [activeFilter, setActiveFilter] = useState<CommitteeCategory | 'All'>(
    'All',
  )
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    null,
  )

  const filteredCommittees = committees.filter(
    (committee) =>
      activeFilter === 'All' || committee.category === activeFilter,
  )

  return (
    <Section background={nhmunImages.committees} id="committees">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionIntro
          body="Explore the first NHMUN'26 committee slate. Final chair names and study guide links can be updated once the academic team confirms them."
          eyebrow="Our Committees"
          title="Distinct rooms for debate, crisis, and negotiation."
        />

        <div
          aria-label="Committee filters"
          className="flex flex-wrap gap-2"
          role="group"
        >
          {committeeFilters.map((filter) => (
            <Button
              aria-pressed={activeFilter === filter}
              className={cn(
                'min-h-10 px-4 py-2 text-xs',
                activeFilter !== filter &&
                  'bg-cream/55 text-burgundy hover:bg-cream',
              )}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
              variant={activeFilter === filter ? 'primary' : 'secondary'}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {filteredCommittees.map((committee) => (
          <CommitteeCard
            committee={committee}
            key={committee.id}
            onSelect={setSelectedCommittee}
          />
        ))}
      </div>

      <Modal
        isOpen={Boolean(selectedCommittee)}
        onClose={() => setSelectedCommittee(null)}
        title={selectedCommittee?.name ?? ''}
      >
        {selectedCommittee && <CommitteeDetail committee={selectedCommittee} />}
      </Modal>
    </Section>
  )
}

function TeamMemberCard({ member }: { member: (typeof teamMembers)[number] }) {
  const Icon = teamDepartmentIcons[member.department]

  return (
    <ParchmentCard className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-burgundy text-cream">
          <Icon aria-hidden size={22} />
        </div>
        <span className="rounded-full border border-burgundy/20 px-3 py-1 text-xs font-bold text-burgundy">
          {member.department}
        </span>
      </div>
      <h3 className="mt-6 font-serif text-3xl font-bold leading-tight text-burgundy-dark">
        {member.role}
      </h3>
      <p className="mt-2 text-sm font-extrabold uppercase tracking-[0.18em] text-burgundy">
        {member.name}
      </p>
      <p className="mt-5 leading-7 text-ink/72">{member.bio}</p>
    </ParchmentCard>
  )
}

function TeamSection() {
  return (
    <Section background={nhmunImages.team} id="team">
      <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionIntro
            body="The NHMUN26 team structure is built around clear ownership: academic quality, participant logistics, media presence, and conference leadership."
            eyebrow="Our Team"
            title="A conference team built around clarity and care."
          />

          <DecorativeFrame className="mt-10 bg-cream/35">
            <div className="rounded-lg bg-cream/82 p-6">
              <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-burgundy">
                Team operating model
              </p>
              <div className="mt-6 grid gap-4">
                {teamDepartments.map((department, index) => {
                  const Icon = teamSummaryIcons[index]

                  return (
                    <div
                      className="grid gap-4 rounded-lg border border-burgundy/15 bg-parchment/45 p-4 sm:grid-cols-[auto_1fr]"
                      key={department.label}
                    >
                      <div className="flex size-11 items-center justify-center rounded-full bg-burgundy text-cream">
                        <Icon aria-hidden size={20} />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-burgundy-dark">
                          {department.label}
                        </h3>
                        <p className="mt-1 leading-6 text-ink/72">
                          {department.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </DecorativeFrame>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </Section>
  )
}

function App() {
  if (window.location.pathname === '/admin') {
    return <AdminApp />
  }

  return (
    <main className="min-h-screen bg-parchment text-ink">
      <Header />
      <Hero />

      <AboutSection />

      <CommitteesSection />

      <TeamSection />

      <Section background={nhmunImages.apply} id="apply">
        <div className="grid items-start gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <SectionIntro
            body="Choose your role, complete the required details, and review your application before submitting it to the NHMUN'26 team."
            eyebrow="Apply Now"
            title="Applications for NHMUN'26 start here."
          />
          <ApplicationForm />
        </div>
      </Section>

      <footer className="bg-cedar px-5 py-12 text-cream md:px-8" id="contact">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-serif text-3xl font-bold">{conference.name}</p>
            <p className="mt-2 text-cream/70">{conference.location}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href={conference.instagramUrl}
              rel="noreferrer"
              target="_blank"
            >
              Instagram
            </ButtonLink>
            <ButtonLink href={`mailto:${conference.contactEmail}`}>
              Email
            </ButtonLink>
            <ButtonLink href="#home" variant="secondary">
              Back to Top
            </ButtonLink>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App
