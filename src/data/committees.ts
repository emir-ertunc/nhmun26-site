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
    agenda:
      'Strengthening international cooperation against the illicit trafficking of cultural heritage.',
    capacity: '36 delegates',
    category: 'GA',
    chairs: ['To be announced'],
    description:
      'A procedure-focused General Assembly committee for delegates who want balanced speeches, draft resolution work, and broad diplomatic negotiation.',
    difficulty: 'Beginner',
    id: 'unga',
    language: 'English',
    name: 'United Nations General Assembly',
    shortName: 'UNGA',
  },
  {
    agenda:
      'Addressing regional security risks and humanitarian access in a rapidly escalating crisis.',
    capacity: '18 delegates',
    category: 'Crisis',
    chairs: ['To be announced'],
    description:
      'A fast-moving crisis committee where delegates respond to updates, negotiate under pressure, and make decisions with immediate consequences.',
    difficulty: 'Advanced',
    id: 'crisis-cabinet',
    language: 'English',
    name: 'Crisis Cabinet',
    shortName: 'Crisis',
  },
  {
    agenda:
      'Protecting education systems and youth cultural participation in post-disaster recovery.',
    capacity: '28 delegates',
    category: 'Specialized',
    chairs: ['To be announced'],
    description:
      'A specialized committee that connects education, cultural policy, and recovery planning through focused research and practical resolution writing.',
    difficulty: 'Intermediate',
    id: 'unesco',
    language: 'English',
    name: 'United Nations Educational, Scientific and Cultural Organization',
    shortName: 'UNESCO',
  },
  {
    agenda:
      'Evaluating legal responsibility and diplomatic remedies in a dispute over protected historic sites.',
    capacity: '20 participants',
    category: 'Specialized',
    chairs: ['To be announced'],
    description:
      'A legal-specialized room for participants who prefer argument structure, evidence-based reasoning, and formal position building.',
    difficulty: 'Advanced',
    id: 'icj',
    language: 'English',
    name: 'International Court of Justice',
    shortName: 'ICJ',
  },
] as const satisfies readonly Committee[]
