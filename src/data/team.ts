import academicAdvisorToprakBoyrazAvif from '../assets/nhmun/team/academic-advisor-toprak-boyraz.avif'
import academicAdvisorToprakBoyrazWebp from '../assets/nhmun/team/academic-advisor-toprak-boyraz.webp'
import deputySecretaryGeneralAyseKilincAvif from '../assets/nhmun/team/deputy-secretary-general-ayse-kilinc.avif'
import deputySecretaryGeneralAyseKilincWebp from '../assets/nhmun/team/deputy-secretary-general-ayse-kilinc.webp'
import directorGeneralNursimaKazgolAvif from '../assets/nhmun/team/director-general-nursima-kazgol.avif'
import directorGeneralNursimaKazgolWebp from '../assets/nhmun/team/director-general-nursima-kazgol.webp'
import headOfMediaBerenAsliturkAvif from '../assets/nhmun/team/head-of-media-beren-asliturk.avif'
import headOfMediaBerenAsliturkWebp from '../assets/nhmun/team/head-of-media-beren-asliturk.webp'
import headOfOrganizationKamilArasanAvif from '../assets/nhmun/team/head-of-organization-kamil-arasan.avif'
import headOfOrganizationKamilArasanWebp from '../assets/nhmun/team/head-of-organization-kamil-arasan.webp'
import secretaryGeneralTubaArslanAvif from '../assets/nhmun/team/secretary-general-tuba-arslan.avif'
import secretaryGeneralTubaArslanWebp from '../assets/nhmun/team/secretary-general-tuba-arslan.webp'

export type TeamMember = {
  bio: string
  department: 'Secretariat' | 'Academic' | 'Organization' | 'Press'
  id: string
  imageAlt: string
  imageAvif: string
  imageWebp: string
  name: string
  role: string
}

export const teamMembers = [
  {
    bio: 'Leads the academic and diplomatic direction of NHMUN26.',
    department: 'Secretariat',
    id: 'secretary-general',
    imageAlt: 'Tuba Arslan, Secretary General of NHMUN26',
    imageAvif: secretaryGeneralTubaArslanAvif,
    imageWebp: secretaryGeneralTubaArslanWebp,
    name: 'Tuba Arslan',
    role: 'Secretary General',
  },
  {
    bio: 'Coordinates the secretariat workflow and supports committee readiness.',
    department: 'Secretariat',
    id: 'deputy-secretary-general',
    imageAlt: 'Ayşe Kılınç, Deputy Secretary General of NHMUN26',
    imageAvif: deputySecretaryGeneralAyseKilincAvif,
    imageWebp: deputySecretaryGeneralAyseKilincWebp,
    name: 'Ayşe Kılınç',
    role: 'Deputy Secretary General',
  },
  {
    bio: 'Oversees operations, venue coordination, and participant logistics.',
    department: 'Organization',
    id: 'director-general',
    imageAlt: 'Nursima Kazgöl, Director General of NHMUN26',
    imageAvif: directorGeneralNursimaKazgolAvif,
    imageWebp: directorGeneralNursimaKazgolWebp,
    name: 'Nursima Kazgöl',
    role: 'Director General',
  },
  {
    bio: 'Shapes committee standards, agenda quality, and study guide direction.',
    department: 'Academic',
    id: 'academic-coordinator',
    imageAlt: 'Toprak Boyraz, Academic Advisor of NHMUN26',
    imageAvif: academicAdvisorToprakBoyrazAvif,
    imageWebp: academicAdvisorToprakBoyrazWebp,
    name: 'Toprak Boyraz',
    role: 'Academic Advisor',
  },
  {
    bio: 'Organizes the delegate experience across registration and conference days.',
    department: 'Organization',
    id: 'head-of-organization',
    imageAlt: 'Kamil Arasan, Head of Organization of NHMUN26',
    imageAvif: headOfOrganizationKamilArasanAvif,
    imageWebp: headOfOrganizationKamilArasanWebp,
    name: 'Kamil Arasan',
    role: 'Head of Organization',
  },
  {
    bio: 'Builds the public voice of the conference through media and coverage.',
    department: 'Press',
    id: 'head-of-media',
    imageAlt: 'Beren Aslıtürk, Head of Media of NHMUN26',
    imageAvif: headOfMediaBerenAsliturkAvif,
    imageWebp: headOfMediaBerenAsliturkWebp,
    name: 'Beren Aslıtürk',
    role: 'Head of Media',
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
