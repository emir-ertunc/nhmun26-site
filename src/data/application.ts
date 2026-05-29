export type ApplicationRole =
  | 'Admin'
  | 'Press'
  | 'Delegation'
  | 'Delegate'
  | 'Chairboard'

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
    description: 'Apply for the admin team and support conference operations.',
    role: 'Admin',
  },
  {
    description: 'Join the media team and document the conference.',
    role: 'Press',
  },
  {
    description: 'Register a school or group delegation.',
    role: 'Delegation',
  },
  {
    description: 'Apply as an individual delegate for one of the committees.',
    role: 'Delegate',
  },
  {
    description: 'Apply for academic leadership as part of the chairboard.',
    role: 'Chairboard',
  },
] as const satisfies readonly {
  description: string
  role: ApplicationRole
}[]

export const personalFields = [
  {
    id: 'fullName',
    label: 'Name & Surname',
    placeholder: 'Your name and surname',
    required: true,
  },
  {
    id: 'dateOfBirth',
    label: 'Date of Birth',
    placeholder: 'DD/MM/YYYY',
    required: true,
  },
  {
    id: 'grade',
    label: 'Grade',
    placeholder: '9, 10, 11, 12...',
    required: true,
  },
  {
    id: 'gender',
    label: 'Gender',
    placeholder: 'Your gender',
    required: true,
  },
  {
    id: 'email',
    label: 'E-Mail address',
    placeholder: 'name@example.com',
    required: true,
  },
  {
    id: 'phone',
    label: 'Phone Number (excluding 0)',
    placeholder: '5XX XXX XX XX',
    required: true,
  },
  {
    id: 'school',
    label: 'School / Institution',
    placeholder: 'Your school or institution',
    required: true,
  },
] as const satisfies readonly ApplicationField[]

export const roleFields = {
  Admin: [
    {
      id: 'teammateScenario',
      label:
        'One of your teammates is not doing their own tasks and gives their work to you and the other team members. What would you do in this situation?',
      multiline: true,
      placeholder: 'Explain how you would handle the situation.',
      required: true,
    },
    {
      id: 'rudeInteractionScenario',
      label:
        'Imagine that you have a problem with a chair or a delegate in your committee. For example, they speak loudly to you or give orders in a rude way. What would you do?',
      multiline: true,
      placeholder: 'Explain your response and communication approach.',
      required: true,
    },
    {
      id: 'adminReadiness',
      label:
        'Are you ready for this? Can you stay at the conference venue until late hours if needed for tasks such as ending sessions or cleaning the committee rooms? If you stay in a dormitory, can you get permission?',
      multiline: true,
      placeholder: 'Write your availability and any permission details.',
      required: true,
    },
    {
      id: 'previousMunExperiences',
      label: 'Please write your previous MUN experiences',
      multiline: true,
      placeholder: "Example: NHMUN'26 / Delegate / Best Delegate",
      required: true,
    },
    {
      id: 'additionalInfo',
      label: 'Is there anything else you would like to add?',
      multiline: true,
      placeholder: 'Optional additional information.',
    },
    {
      id: 'references',
      label: 'Reference(s) (optional)',
      multiline: true,
      placeholder: 'Names, roles, or contact details if available.',
    },
  ],
  Chairboard: [
    {
      id: 'preferredCommittees',
      label: 'Committee preference(s)',
      multiline: true,
      placeholder:
        'Write the committee or committees you are applying for. Example: FCC, MKK, SPECPOL',
      required: true,
    },
    {
      id: 'experienceList',
      label: 'Experience list',
      multiline: true,
      placeholder: "Example: NHMUN'26 / Delegate / Best Delegate",
      required: true,
    },
    {
      help: 'At least 150 words.',
      id: 'chairboardMotivation',
      label: 'Motivation letter',
      multiline: true,
      placeholder: 'Write your motivation for applying to chairboard.',
      required: true,
    },
    {
      id: 'delegateDisagreementScenario',
      label:
        "The delegates had a disagreement amongst themselves and couldn't reach a solution. How can you resolve this situation without disrupting the committee's functioning?",
      multiline: true,
      placeholder: 'Explain your moderation approach.',
      required: true,
    },
    {
      id: 'directiveProcedure',
      label:
        'Explain the directive procedure and what you consider to be the most important aspect of the directive. (If you have only selected crisis committees, please fill in this field.)',
      multiline: true,
      placeholder: 'Explain the directive procedure.',
    },
    {
      id: 'montcalmDirective',
      label:
        'Date: September 13, 1759. Imagine yourself as the Commander-in-Chief of the Army of New France, Marquis de Montcalm. Under the cover of night, the British army scaled the steep cliffs and deployed in battle formation on the plains just outside the walls of Quebec. You have chosen to leave the safety of the fortress walls to confront them on the open field. Your elite French reinforcement of 3,000 men is currently on the march, just a few kilometers away. How will you defeat the British? Explain your strategy in the form of directives. (French Royal Regular Infantry: 2,000, Canadian Militia: 2,500, Native Warriors: 500, Artillery: 4 field guns) (If you have only selected crisis committees, please fill in this field.)',
      multiline: true,
      placeholder: 'Write your strategy in directive form.',
    },
    {
      id: 'lolKnowledge',
      label:
        'How well do you know the LoL universe and what is your LoL rank? (Mandatory only for those applying for the FCC Committee.)',
      multiline: true,
      placeholder: 'Answer if you are applying for FCC.',
    },
    {
      id: 'specialGaSeries',
      label:
        'Have you watched the series? If so, describe one of the season finales to demonstrate your command of the show. (Mandatory only for those applying for the Special GA Committee.)',
      multiline: true,
      placeholder: 'Answer if you are applying for Special GA.',
    },
    {
      id: 'gaProcedure',
      label:
        'Explain the rules of procedure for the General Assembly. (Mandatory only for those applying for the General Assembly Committees.)',
      multiline: true,
      placeholder: 'Explain GA procedure.',
    },
    {
      id: 'supportDelegateScenario',
      label:
        "Your delegate's English is not very good and they cannot join the committee actively. Also, they do not understand how to write a resolution paper. What will you do to help your delegate join the committee actively? (Only for those choosing General Assembly committees.)",
      multiline: true,
      placeholder: 'Explain how you would support the delegate.',
    },
  ],
  Delegate: [
    {
      id: 'experienceList',
      label: 'Experience list',
      multiline: true,
      placeholder: "Example: NHMUN'26 / Delegate / Best Delegate",
      required: true,
    },
    {
      help: 'At least 150 words.',
      id: 'motivationLetter',
      label: 'Motivation letter',
      multiline: true,
      placeholder: 'Write your motivation for joining NHMUN26.',
      required: true,
    },
  ],
  Delegation: [
    {
      id: 'delegationMemberCount',
      label:
        "How many members are currently in your school's delegation group and MUN club?",
      multiline: true,
      placeholder: 'Write the current number of members.',
      required: true,
    },
    {
      id: 'delegationRole',
      label:
        'What is your role in your delegation team and MUN club, and have you ever organized or led a delegation from your school?',
      multiline: true,
      placeholder: 'Describe your role and leadership experience.',
      required: true,
    },
  ],
  Press: [
    {
      id: 'cameraModel',
      label: 'What is the brand & model of camera you use?',
      placeholder: 'Camera brand and model',
      required: true,
    },
    {
      id: 'photographyInterest',
      label: 'Aside from conferences, are you interested in photography?',
      multiline: true,
      placeholder: 'Tell us about your photography interest.',
      required: true,
    },
    {
      id: 'additionalEquipment',
      label:
        'Do you have any additional equipment besides your camera? (extra SD card, tripod, lens, etc.)',
      multiline: true,
      placeholder: 'List your additional equipment or write none.',
      required: true,
    },
    {
      id: 'pressReadiness',
      label: 'Are you ready for this? (Photography)',
      multiline: true,
      placeholder: 'Confirm your readiness and availability.',
      required: true,
    },
    {
      id: 'backlightScenario',
      label:
        'A delegate is sitting in front of a window, and sunlight is coming from behind them, causing their face to appear dark. There are no curtains in the committee room that you can close. What would you do to obtain a proper photograph in this situation?',
      multiline: true,
      placeholder: 'Explain how you would take a proper photograph.',
      required: true,
    },
    {
      id: 'previousMunExperiences',
      label: 'Please write your previous MUN experiences',
      multiline: true,
      placeholder: "Example: NHMUN'26 / Delegate / Best Delegate",
      required: true,
    },
    {
      id: 'additionalInfo',
      label: 'Is there anything else you would like to add?',
      multiline: true,
      placeholder: 'Optional additional information.',
    },
    {
      id: 'references',
      label: 'Reference(s)',
      multiline: true,
      placeholder: 'Names, roles, or contact details if available.',
      required: true,
    },
  ],
} as const satisfies Record<ApplicationRole, readonly ApplicationField[]>
