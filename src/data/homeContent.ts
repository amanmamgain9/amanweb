export type HeroStat = {
  label: string;
  value: string;
};

export type ExperienceEntry = {
  id: string;
  period: string;
  company: string;
  role: string;
  signal: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export const homeContent = {
  hero: {
    eyebrow: '',
    name: 'Aman Mamgain',
    title: 'Full-stack engineer.',
    summary:
      'I build product systems across web and mobile.',
    supporting:
      'Ten years across product engineering, founding builds, game workflows, and AI powered applications.',
    stats: [
      { label: 'Years shipping', value: '10+' },
      { label: 'Modes', value: 'Web / Mobile / Games / AI' },
    ] satisfies HeroStat[],
  },
  experiences: [
    {
      id: 'independent-products',
      period: '2025 - 2026',
      company: 'Independent Product Builder',
      role: 'PlanMyWorkday.com and AIAnkiPro.com',
      signal: '',
      summary:
        'Built multiple products.',
      highlights: [
        'PlanMyWorkday.com: keyboard-first daily planner with integrated timer for low-friction execution.',
        'AIAnkiPro.com: converts notes, videos, and AI chats into flashcards with Learn and Shuffle review modes.',
      ],
      stack: ['Full-stack web', 'AI-assisted workflows', 'Product iteration'],
    },
    {
      id: 'glip',
      period: '2021 - 2024',
      company: 'Glip',
      role: 'Founding Engineer',
      signal: '',
      summary:
        'Built product systems across Electron, web, and Unity.',
      highlights: [
        'Developed low-latency game capture app in Electron using OBS APIs.',
        'Built web flows for NFT creation and auction, wallet operations, and crypto reward tasks.',
        'Implemented Unity gameplay features: crouch, scoreboard, vault and loadout customization, and quick-sell with infinite-scroll selection.',
        'Integrated proximity voice chat and AI character chat with monetized React interface.',
      ],
      stack: ['Electron', 'React', 'Node.js', 'Unity', 'C#', 'Applied AI'],
    },
    {
      id: 'spinny',
      period: '2019 - 2021',
      company: 'Spinny',
      role: 'Tech Lead',
      signal: '',
      summary:
        'Led full-stack delivery for vehicle-finance operations.',
      highlights: [
        'Built React Native iOS app for client management workflows.',
        'Led backend development for loan application automation.',
        'Implemented dynamic questionnaires for profiling and loan approval prediction.',
      ],
      stack: ['Django', 'React', 'React Native', 'Workflow Design'],
    },
    {
      id: 'innovaccer',
      period: '2019',
      company: 'Innovaccer',
      role: 'SDE-2',
      signal: '',
      summary:
        'Consolidated healthcare workflows into a maintainable product base.',
      highlights: [
        'Unified multi-client patient-care coordinator variants into one codebase.',
        'Built Elasticsearch query generator for retrieval workflows.',
        'Containerized local environment to remove staging API dependency.',
      ],
      stack: ['Django', 'Pyramid', 'Elasticsearch', 'Containers'],
    },
    {
      id: 'back2stores',
      period: '2017 - 2019',
      company: 'Back2Stores',
      role: 'Co-founder and Full-stack Engineer',
      signal: '',
      summary:
        'Served as sole technical lead for a B2B commerce platform.',
      highlights: [
        'Scaled platform to 30+ enterprise clients.',
        'Built Android commerce app connecting manufacturers to consumers.',
        'Implemented order management, BOM, inventory tracking, and warehouse monitoring.',
        'Managed AWS infrastructure and RabbitMQ plus Celery messaging workflows.',
      ],
      stack: ['Angular', 'Android', 'Django', 'AWS', 'RabbitMQ'],
    },
    {
      id: 'ht-media',
      period: '2014 - 2017',
      company: 'HT Media',
      role: 'Software Developer',
      signal: '',
      summary:
        'Built and optimized internal and growth-facing web systems.',
      highlights: [
        'Optimized Application Management System for performance and debugging.',
        'Developed multi-client test management system.',
        'Implemented autosuggestion, payment integration, lead forms, SEO flows, and analytics dashboards.',
      ],
      stack: ['Django', 'jQuery', 'Web Product Engineering'],
    },
  ] satisfies ExperienceEntry[],
  links: {
    calendly: 'https://calendly.com/amanmamgain9/30min',
    email: 'mailto:amanmamgain9@gmail.com',
    github: 'https://github.com/amanmamgain9',
    linkedin: 'https://linkedin.com/in/aman-mamgain-7729599b/',
    resume: '/aman.pdf',
  },
};
