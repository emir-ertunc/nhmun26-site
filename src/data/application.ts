export type ApplicationRole =
  | 'Delegate'
  | 'Delegation'
  | 'Chair'
  | 'Press'
  | 'Organization Team'

export type ApplicationField = {
  help?: string
  id: string
  label: string
  multiline?: boolean
  placeholder: string
  required?: boolean
}

export const applicationRoles = [
  {
    description: 'Apply as an individual delegate for one of the committees.',
    role: 'Delegate',
  },
  {
    description: 'Register a school or group delegation with an advisor.',
    role: 'Delegation',
  },
  {
    description: 'Apply for academic leadership as a committee chair.',
    role: 'Chair',
  },
  {
    description: 'Join the media team and document the conference.',
    role: 'Press',
  },
  {
    description: 'Support logistics, registration, and conference operations.',
    role: 'Organization Team',
  },
] as const satisfies readonly {
  description: string
  role: ApplicationRole
}[]

export const personalFields = [
  {
    id: 'fullName',
    label: 'Full name',
    placeholder: 'Your full name',
    required: true,
  },
  {
    id: 'email',
    label: 'Email',
    placeholder: 'name@example.com',
    required: true,
  },
  {
    id: 'phone',
    label: 'Phone',
    placeholder: '+90 ...',
    required: true,
  },
  {
    id: 'school',
    label: 'School',
    placeholder: 'Your school',
    required: true,
  },
  {
    id: 'grade',
    label: 'Grade',
    placeholder: '9, 10, 11, 12...',
    required: true,
  },
  {
    id: 'city',
    label: 'City',
    placeholder: 'Izmir',
    required: true,
  },
  {
    id: 'experience',
    label: 'Previous MUN experience',
    multiline: true,
    placeholder: 'Briefly list your previous conferences or write none.',
    required: true,
  },
] as const satisfies readonly ApplicationField[]

export const roleFields = {
  Chair: [
    {
      id: 'preferredCommittee',
      label: 'Preferred committee',
      placeholder: 'UNGA, Crisis, UNESCO, ICJ...',
      required: true,
    },
    {
      id: 'chairExperience',
      label: 'Chair experience',
      multiline: true,
      placeholder: 'Describe previous chairing or academic team experience.',
      required: true,
    },
    {
      id: 'academicExperience',
      label: 'Academic experience',
      multiline: true,
      placeholder: 'Research, study guides, debate training, awards...',
      required: true,
    },
    {
      id: 'chairMotivation',
      label: 'Motivation',
      multiline: true,
      placeholder: 'Why do you want to chair at NHMUN26?',
      required: true,
    },
  ],
  Delegate: [
    {
      id: 'committeePreferences',
      label: 'Committee preferences',
      placeholder: '1. UNESCO, 2. UNGA, 3. ICJ',
      required: true,
    },
    {
      id: 'countryPreferences',
      label: 'Country preferences',
      placeholder: 'List three country preferences if applicable.',
      required: true,
    },
    {
      id: 'motivation',
      label: 'Motivation letter',
      multiline: true,
      placeholder: 'Why do you want to participate in NHMUN26?',
      required: true,
    },
    {
      id: 'previousConferences',
      label: 'Previous conferences',
      multiline: true,
      placeholder: 'List previous conferences or write none.',
      required: true,
    },
  ],
  Delegation: [
    {
      id: 'delegationName',
      label: 'School / delegation name',
      placeholder: 'Delegation name',
      required: true,
    },
    {
      id: 'advisorName',
      label: 'Advisor name',
      placeholder: 'Advisor full name',
      required: true,
    },
    {
      id: 'advisorEmail',
      label: 'Advisor email',
      placeholder: 'advisor@example.com',
      required: true,
    },
    {
      id: 'delegateCount',
      label: 'Delegate count',
      placeholder: 'Expected number of delegates',
      required: true,
    },
    {
      id: 'delegationCommittees',
      label: 'Preferred committees',
      multiline: true,
      placeholder: 'List committee preferences for the delegation.',
      required: true,
    },
  ],
  'Organization Team': [
    {
      id: 'departmentPreference',
      label: 'Preferred department',
      placeholder: 'Logistics, registration, delegate relations...',
      required: true,
    },
    {
      id: 'availability',
      label: 'Availability',
      multiline: true,
      placeholder:
        'Tell us when you are available before and during the event.',
      required: true,
    },
    {
      id: 'organizationExperience',
      label: 'Previous organization experience',
      multiline: true,
      placeholder: 'Describe previous team, event, or school club experience.',
      required: true,
    },
  ],
  Press: [
    {
      id: 'pressRole',
      label: 'Preferred press role',
      placeholder: 'Photography, writing, social media, design...',
      required: true,
    },
    {
      id: 'portfolio',
      label: 'Portfolio / social media link',
      placeholder: 'Instagram, drive folder, portfolio URL...',
      required: true,
    },
    {
      id: 'pressExperience',
      label: 'Experience',
      multiline: true,
      placeholder: 'Tell us about your media, design, or writing experience.',
      required: true,
    },
  ],
} as const satisfies Record<ApplicationRole, readonly ApplicationField[]>
