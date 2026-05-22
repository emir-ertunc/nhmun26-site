import aboutAvif from './about-background.avif'
import aboutWebp from './about-background.webp'
import applyAvif from './apply-background.avif'
import applyWebp from './apply-background.webp'
import buttonReferenceAvif from './button-reference.avif'
import buttonReferenceWebp from './button-reference.webp'
import committeesAvif from './committees-background.avif'
import committeesWebp from './committees-background.webp'
import mainAvif from './main-background.avif'
import mainWebp from './main-background.webp'
import teamAvif from './team-background.avif'
import teamWebp from './team-background.webp'

export const nhmunImages = {
  main: {
    avif: mainAvif,
    webp: mainWebp,
    alt: "NHMUN'26 laurel crest over a parchment background",
  },
  buttonReference: {
    avif: buttonReferenceAvif,
    webp: buttonReferenceWebp,
    alt: "NHMUN'26 parchment navigation style reference",
  },
  about: {
    avif: aboutAvif,
    webp: aboutWebp,
    alt: 'Warm parchment pattern for the about section',
  },
  committees: {
    avif: committeesAvif,
    webp: committeesWebp,
    alt: 'Parchment illustration with a tree and dice',
  },
  team: {
    avif: teamAvif,
    webp: teamWebp,
    alt: 'Warm parchment pattern for the team section',
  },
  apply: {
    avif: applyAvif,
    webp: applyWebp,
    alt: 'Anatolian patterned parchment with an olive tree',
  },
} as const

export type NhmunImage = (typeof nhmunImages)[keyof typeof nhmunImages]
