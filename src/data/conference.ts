export const conference = {
  name: "NHMUN'26",
  date: '10-11-12 July 2026',
  startsAt: '2026-07-10T00:00:00+03:00',
  location: 'Barbaros Hayrettin Middle School / Izmir Konak',
  instagramUrl: 'https://www.instagram.com/nhmun26/',
  tagline: 'Where heritage meets diplomacy.',
} as const

export const aboutHighlights = [
  {
    label: '3 Days',
    value: '10-11-12 July',
    description: 'A focused conference calendar built around debate rounds.',
  },
  {
    label: 'Format',
    value: 'Model United Nations',
    description:
      'Academic procedure, diplomacy, negotiation, and resolution writing.',
  },
  {
    label: 'Venue',
    value: 'Izmir Konak',
    description:
      'Hosted at Barbaros Hayrettin Middle School in the city center.',
  },
  {
    label: 'Focus',
    value: 'Academic Diplomacy',
    description:
      'A disciplined space for delegates to speak, listen, and lead.',
  },
] as const

export const aboutPillars = [
  {
    title: 'Procedure with purpose',
    body: 'NHMUN26 is designed for delegates who want a clear committee flow, structured speaking time, and debate that rewards preparation.',
  },
  {
    title: 'Heritage-led atmosphere',
    body: 'The visual identity connects MUN formality with warm parchment textures, laurel marks, and local Izmir references.',
  },
  {
    title: 'Accessible academic growth',
    body: 'The conference is shaped for students who are building confidence in public speaking, research, and diplomatic writing.',
  },
] as const

export const conferenceRhythm = [
  'Opening and orientation',
  'Committee sessions and moderated caucuses',
  'Resolution drafting and voting',
  'Closing ceremony and awards',
] as const

export const navigationItems = [
  { href: '#home', id: 'home', label: 'Home' },
  { href: '#about', id: 'about', label: 'About Us' },
  { href: '#committees', id: 'committees', label: 'Our Committees' },
  { href: '#team', id: 'team', label: 'Our Team' },
  { href: '#apply', id: 'apply', label: 'Apply Now' },
  { href: '#contact', id: 'contact', label: 'Contact' },
] as const
