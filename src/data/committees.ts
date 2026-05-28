export type CommitteeCategory = 'GA' | 'Crisis' | 'Specialized'

export type Committee = {
  agenda: string
  capacity: string
  category: CommitteeCategory
  chairs: readonly string[]
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  id: string
  language: 'English'
  name: string
  shortName: string
  studyGuideUrl?: string
}

export const committeeFilters = ['All', 'GA', 'Crisis', 'Specialized'] as const

export const committees = [
  {
    agenda: 'Seven Years War',
    capacity: '70 Delegates',
    category: 'Crisis',
    chairs: ['To be announced'],
    description:
      "This committee reshapes the military and diplomatic fronts of the Seven Years' War, widely considered the world's first global conflict. Delegates will rewrite the global balance of power by defending the interests of colonial empires, indigenous peoples, and major alliances.",
    difficulty: 'Advanced',
    id: 'mkk',
    language: 'English',
    name: 'MKK',
    shortName: 'MKK',
  },
  {
    agenda: 'League of Legends (LoL) / Arcane',
    capacity: '40 Delegates',
    category: 'Crisis',
    chairs: ['To be announced'],
    description:
      'Set amidst the conflict of magic, technology, and class division between Piltover and Zaun, this fictional crisis committee puts the fate of the Arcane universe up for debate. Stepping into the shoes of iconic characters, participants will either steer the inevitable clash toward peace or plunge both cities into total destruction.',
    difficulty: 'Advanced',
    id: 'fcc',
    language: 'English',
    name: 'FCC',
    shortName: 'FCC',
  },
  {
    agenda: 'To be announced',
    capacity: '20 Delegates',
    category: 'GA',
    chairs: ['To be announced'],
    description:
      "This committee aims to deliver sustainable solutions to urgent ecological threats facing our planet, such as the climate crisis and global pollution. Delegates will engage in intense diplomacy to strike a balance between nations' economic interests and the transition to green energy.",
    difficulty: 'Beginner',
    id: 'unep',
    language: 'English',
    name: 'UNEP',
    shortName: 'UNEP',
  },
  {
    agenda: 'To be announced',
    capacity: '20 Delegates',
    category: 'Specialized',
    chairs: ['To be announced'],
    description:
      'Tackling borderless crimes, this dynamic committee will dissect the operations of organized crime syndicates, cyberattacks, and international trafficking networks. Participants will develop strategies to enhance cross-border intelligence sharing and operational cooperation to safeguard global security.',
    difficulty: 'Intermediate',
    id: 'interpol',
    language: 'English',
    name: 'INTERPOL',
    shortName: 'INTERPOL',
  },
  {
    agenda: 'To be announced',
    capacity: '20 Delegates',
    category: 'GA',
    chairs: ['To be announced'],
    description:
      "Assembled with the mission to protect global public health, this committee focuses on critical issues like pandemic risks and inequalities in healthcare access. Armed with scientific data, delegates will draft concrete action plans to prevent potential crises and elevate the well-being of the world's population.",
    difficulty: 'Beginner',
    id: 'who',
    language: 'English',
    name: 'WHO',
    shortName: 'WHO',
  },
  {
    agenda: 'To be announced',
    capacity: '20 Delegates',
    category: 'GA',
    chairs: ['To be announced'],
    description:
      "Gathered to advance gender equality and combat violence against women, this committee serves as a vital platform for human rights-driven diplomacy. Participants will pursue global and legal solutions to chronic issues such as workplace discrimination and girls' access to education.",
    difficulty: 'Beginner',
    id: 'un-women',
    language: 'English',
    name: 'UN WOMEN',
    shortName: 'UN WOMEN',
  },
  {
    agenda: 'To be announced',
    capacity: '20 Delegates',
    category: 'GA',
    chairs: ['To be announced'],
    description:
      'This committee addresses sensitive geopolitical issues, including the remnants of colonialism, the future of peacekeeping operations, and border disputes. Under the framework of international law, delegates will negotiate to maintain stability in conflict zones and uphold the right to self-determination.',
    difficulty: 'Intermediate',
    id: 'specpol',
    language: 'English',
    name: 'SPECPOL (Special Political and Decolonization Committee)',
    shortName: 'SPECPOL',
  },
  {
    agenda: '16th Term of the TBMM (1977-1980)',
    capacity: '70 Delegates',
    category: 'Specialized',
    chairs: ['To be announced'],
    description:
      'Shedding light on one of the most turbulent and politically polarized eras in Turkish history, the fate of the parliament rests entirely in the hands of the delegates. Participants will take the parliamentary floor to resolve the ongoing national crisis and curb political violence on the road leading up to the 1980 coup.',
    difficulty: 'Advanced',
    id: 'tbmm',
    language: 'English',
    name: 'TBMM',
    shortName: 'TBMM',
  },
  {
    agenda: 'To be announced',
    capacity: '20 Delegates',
    category: 'Specialized',
    chairs: ['To be announced'],
    description:
      "Exploring Turkey's socio-cultural dynamics through the clash between a modern and a conservative family, this unique committee offers an entertaining yet profound simulation. Representing popular characters from the show, delegates will dissect societal prejudices, complex family dynamics, and social class differences.",
    difficulty: 'Intermediate',
    id: 'special-ga',
    language: 'English',
    name: 'Special General Assembly',
    shortName: 'Special GA',
  },
] as const satisfies readonly Committee[]
