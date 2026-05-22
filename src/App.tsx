import { nhmunImages } from './assets/nhmun'
import { Button } from './components/Button'
import { DecorativeFrame } from './components/DecorativeFrame'
import { ParchmentCard } from './components/ParchmentCard'
import { ResponsiveImage } from './components/ResponsiveImage'
import { Section } from './components/Section'
import { conference } from './data/conference'

function App() {
  return (
    <main className="min-h-screen bg-parchment text-ink">
      <Section
        background={nhmunImages.about}
        className="min-h-screen"
        id="visual-system"
      >
        <div className="grid min-h-[calc(100vh-10rem)] items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="mb-5 text-sm font-extrabold uppercase tracking-[0.32em] text-burgundy">
              Model United Nations Conference
            </p>
            <h1 className="max-w-3xl text-balance font-serif text-6xl font-bold leading-[0.95] text-burgundy-dark md:text-8xl">
              {conference.name}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/78">
              A parchment-led visual system for NHMUN&apos;26, shaped around
              laurel marks, Anatolian motifs, warm sepia surfaces, and formal
              academic diplomacy.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button type="button">Apply Now</Button>
              <Button type="button" variant="secondary">
                Our Committees
              </Button>
            </div>
          </div>

          <DecorativeFrame>
            <div className="aspect-square overflow-hidden rounded-lg">
              <ResponsiveImage image={nhmunImages.main} loading="eager" />
            </div>
          </DecorativeFrame>
        </div>
      </Section>

      <Section background={nhmunImages.committees}>
        <div className="grid gap-5 md:grid-cols-3">
          <ParchmentCard>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-burgundy">
              Palette
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold">
              Parchment, burgundy, cedar.
            </h2>
          </ParchmentCard>
          <ParchmentCard>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-burgundy">
              Components
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold">
              Buttons, cards, frames, modals.
            </h2>
          </ParchmentCard>
          <ParchmentCard>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-burgundy">
              Assets
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold">
              Optimized AVIF and WebP images.
            </h2>
          </ParchmentCard>
        </div>
      </Section>
    </main>
  )
}

export default App
