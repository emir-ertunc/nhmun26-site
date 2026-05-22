import { CalendarDays, ChevronDown, MapPin, Menu, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { nhmunImages } from './assets/nhmun'
import { ButtonLink } from './components/Button'
import { DecorativeFrame } from './components/DecorativeFrame'
import { ParchmentCard } from './components/ParchmentCard'
import { Section } from './components/Section'
import { conference, navigationItems } from './data/conference'
import { cn } from './lib/cn'

const countdownLabels = {
  days: 'Days',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
} as const

const navigationSectionIds = navigationItems.map((item) => item.id)

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

function App() {
  return (
    <main className="min-h-screen bg-parchment text-ink">
      <Header />
      <Hero />

      <Section background={nhmunImages.about} id="about">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.75fr]">
          <SectionIntro
            body="NHMUN'26 is a three-day academic diplomacy experience in Izmir, built for delegates who want structured debate, clear procedure, and a conference atmosphere shaped by local heritage."
            eyebrow="About Us"
            title="A focused conference for young diplomats."
          />
          <DecorativeFrame>
            <div className="grid min-h-72 gap-4 rounded-lg bg-cream/74 p-6">
              {[
                'Academic discipline',
                'Diplomatic clarity',
                'Izmir heritage',
              ].map((value) => (
                <ParchmentCard
                  className="flex items-center justify-center text-center"
                  key={value}
                >
                  <p className="font-serif text-2xl font-bold text-burgundy-dark">
                    {value}
                  </p>
                </ParchmentCard>
              ))}
            </div>
          </DecorativeFrame>
        </div>
      </Section>

      <Section background={nhmunImages.committees} id="committees">
        <SectionIntro
          body="Committee details will be expanded in Phase 04. This section already defines the landing structure and visual treatment that those cards will use."
          eyebrow="Our Committees"
          title="Distinct rooms for debate, crisis, and negotiation."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <ParchmentCard>
            <p className="font-serif text-3xl font-bold text-burgundy-dark">
              General Assembly
            </p>
            <p className="mt-3 text-ink/72">Procedure-first debate format.</p>
          </ParchmentCard>
          <ParchmentCard>
            <p className="font-serif text-3xl font-bold text-burgundy-dark">
              Crisis Cabinet
            </p>
            <p className="mt-3 text-ink/72">Fast decisions and live updates.</p>
          </ParchmentCard>
          <ParchmentCard>
            <p className="font-serif text-3xl font-bold text-burgundy-dark">
              Specialized Body
            </p>
            <p className="mt-3 text-ink/72">Focused agendas and diplomacy.</p>
          </ParchmentCard>
        </div>
      </Section>

      <Section background={nhmunImages.team} id="team">
        <SectionIntro
          body="The secretariat and organization team area is reserved for Phase 05, with the final staff list, roles, and optional profile photos."
          eyebrow="Our Team"
          title="A conference team built around clarity and care."
        />
      </Section>

      <Section background={nhmunImages.apply} id="apply">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1fr]">
          <SectionIntro
            body="The application flow will become a step-by-step form in Phase 06. For now, this landing shell anchors the application section and call to action."
            eyebrow="Apply Now"
            title="Applications for NHMUN'26 will open here."
          />
          <ParchmentCard className="bg-cream/88">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-burgundy">
              Planned roles
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                'Delegate',
                'Delegation',
                'Chair',
                'Press',
                'Organization Team',
              ].map((role) => (
                <span
                  className="rounded-full border border-burgundy/20 px-4 py-2 text-sm font-bold text-burgundy-dark"
                  key={role}
                >
                  {role}
                </span>
              ))}
            </div>
          </ParchmentCard>
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
