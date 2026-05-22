export const conference = {
  name: "NHMUN'26",
  date: '10-11-12 July 2026',
  startsAt: '2026-07-10T00:00:00+03:00',
  location: 'Barbaros Hayrettin Middle School / Izmir Konak',
  instagramUrl: 'https://www.instagram.com/nhmun26/',
  tagline: 'Where heritage meets diplomacy.',
} as const

export const navigationItems = [
  { href: '#home', id: 'home', label: 'Home' },
  { href: '#about', id: 'about', label: 'About Us' },
  { href: '#committees', id: 'committees', label: 'Our Committees' },
  { href: '#team', id: 'team', label: 'Our Team' },
  { href: '#apply', id: 'apply', label: 'Apply Now' },
  { href: '#contact', id: 'contact', label: 'Contact' },
] as const
