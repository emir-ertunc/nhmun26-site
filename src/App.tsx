import { conference } from './data/conference'

function App() {
  return (
    <main className="min-h-screen bg-parchment text-ink">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-burgundy">
          Model United Nations Conference
        </p>
        <h1 className="font-serif text-5xl font-bold md:text-7xl">
          {conference.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink/75 md:text-xl">
          Phase 00 foundation is ready. NHMUN visual design, sections, and
          application flows will be added in the next phases.
        </p>
        <dl className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-lg border border-burgundy/20 bg-cream/70 px-5 py-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
              Date
            </dt>
            <dd className="mt-2 text-lg font-semibold">{conference.date}</dd>
          </div>
          <div className="rounded-lg border border-burgundy/20 bg-cream/70 px-5 py-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
              Location
            </dt>
            <dd className="mt-2 text-lg font-semibold">
              {conference.location}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  )
}

export default App
