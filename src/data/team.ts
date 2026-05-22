export type TeamMember = {
  bio: string
  department: 'Secretariat' | 'Academic' | 'Organization' | 'Press'
  id: string
  name: string
  role: string
}

export const teamMembers = [
  {
    bio: 'Leads the academic and diplomatic direction of NHMUN26.',
    department: 'Secretariat',
    id: 'secretary-general',
    name: 'To be announced',
    role: 'Secretary-General',
  },
  {
    bio: 'Coordinates the secretariat workflow and supports committee readiness.',
    department: 'Secretariat',
    id: 'deputy-secretary-general',
    name: 'To be announced',
    role: 'Deputy Secretary-General',
  },
  {
    bio: 'Oversees operations, venue coordination, and participant logistics.',
    department: 'Organization',
    id: 'director-general',
    name: 'To be announced',
    role: 'Director-General',
  },
  {
    bio: 'Shapes committee standards, agenda quality, and study guide direction.',
    department: 'Academic',
    id: 'academic-coordinator',
    name: 'To be announced',
    role: 'Academic Coordinator',
  },
  {
    bio: 'Organizes the delegate experience across registration and conference days.',
    department: 'Organization',
    id: 'organization-coordinator',
    name: 'To be announced',
    role: 'Organization Coordinator',
  },
  {
    bio: 'Builds the public voice of the conference through media and coverage.',
    department: 'Press',
    id: 'head-of-press',
    name: 'To be announced',
    role: 'Head of Press',
  },
] as const satisfies readonly TeamMember[]

export const teamDepartments = [
  {
    description: 'Conference leadership and participant-facing decisions.',
    label: 'Secretariat',
  },
  {
    description:
      'Committee quality, procedure, agendas, and chair coordination.',
    label: 'Academic',
  },
  {
    description: 'Venue, registration, logistics, and conference-day flow.',
    label: 'Organization',
  },
  {
    description: 'Visual communication, media coverage, and social presence.',
    label: 'Press',
  },
] as const
