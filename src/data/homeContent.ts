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

export type ProjectEntry = {
  name: string;
  summary: string;
  href: string;
  label: string;
  tags: string[];
};

export type PrincipleEntry = {
  title: string;
  body: string;
};

export const homeContent = {
  hero: {
    eyebrow: '',
    name: 'Aman Mamgain',
    title: 'Full-stack systems, game surfaces, and applied AI.',
    summary:
      'I build product experiences that start as rough fragments and resolve into clear, fast systems. The first screen assembles. The dragon handles the jumps.',
    supporting:
      'Ten years across product engineering, founding builds, game workflows, and AI prototypes.',
    stats: [
      { label: 'Years shipping', value: '10+' },
      { label: 'Product eras', value: '5' },
      { label: 'Modes', value: 'Web / Games / AI' },
    ] satisfies HeroStat[],
  },
  experiences: [
    {
      id: 'glip',
      period: '2021 - 2024',
      company: 'Glip',
      role: 'Founding Engineer',
      signal: 'Capture -> economy',
      summary:
        'Built the bridge from live gameplay moments to ownership, progression, and AI-driven interactions.',
      highlights: [
        'Shipped a low-latency Electron capture stack on top of OBS APIs for mintable game moments.',
        'Built wallet, marketplace, and task-economy surfaces in React and Node for crypto-native gameplay loops.',
        'Implemented BTX gameplay systems in Unity, including progression, loadouts, inventory flows, and proximity voice chat.',
        'Prototyped AI character chat with voice and monetization hooks for in-world interaction.',
      ],
      stack: ['Electron', 'React', 'Node.js', 'Unity', 'C#', 'Applied AI'],
    },
    {
      id: 'spinny',
      period: '2019 - 2021',
      company: 'Spinny',
      role: 'Tech Lead',
      signal: 'Lead -> throughput',
      summary:
        'Took ownership of product velocity across mobile and backend systems for vehicle-finance operations.',
      highlights: [
        'Led development for client management and loan automation flows.',
        'Built React Native iOS interfaces for operational teams handling real-world throughput.',
        'Created dynamic questionnaire systems for profiling and approval prediction.',
      ],
      stack: ['Django', 'React', 'React Native', 'Workflow Design'],
    },
    {
      id: 'innovaccer',
      period: '2019',
      company: 'Innovaccer',
      role: 'SDE-2',
      signal: 'Converge -> simplify',
      summary:
        'Collapsed fragmented healthcare workflows into a cleaner, more maintainable product system.',
      highlights: [
        'Unified multiple patient-care coordinator variants into a single codebase.',
        'Built Elasticsearch query generation for complex data retrieval flows.',
        'Containerized local environments to remove staging dependencies from day-to-day development.',
      ],
      stack: ['Django', 'Pyramid', 'Elasticsearch', 'Containers'],
    },
    {
      id: 'back2stores',
      period: '2017 - 2019',
      company: 'Back2Stores',
      role: 'Co-founder and Full-stack Engineer',
      signal: 'Found -> scale',
      summary:
        'Operated as the technical core of a B2B commerce product and scaled it to enterprise clients.',
      highlights: [
        'Served 30+ enterprise clients as the primary technical lead.',
        'Built Android commerce experiences linking manufacturers, warehouses, and consumers.',
        'Handled order management, inventory, infrastructure, messaging, and operational tooling end to end.',
      ],
      stack: ['Angular', 'Android', 'Django', 'AWS', 'RabbitMQ'],
    },
    {
      id: 'ht-media',
      period: '2014 - 2017',
      company: 'HT Media',
      role: 'Software Developer',
      signal: 'Ship -> sharpen',
      summary:
        'Started in high-volume production systems, learning how to ship features while keeping debugging and performance under control.',
      highlights: [
        'Worked across application management, test management, and growth-facing web systems.',
        'Built autosuggestion, payment integration, lead forms, SEO surfaces, and analytics dashboards.',
        'Learned the production discipline behind debugging, optimization, and iterative shipping.',
      ],
      stack: ['Django', 'jQuery', 'Web Product Engineering'],
    },
  ] satisfies ExperienceEntry[],
  projects: [
    {
      name: 'Kauri Captioner',
      summary:
        'A browser-side subtitling tool powered by Whisper, canvas rendering, and ffmpeg.wasm.',
      href: 'https://amanmamgain9.github.io/sub_gen/',
      label: 'Open project',
      tags: ['React', 'Whisper', 'Canvas API', 'ffmpeg.wasm'],
    },
    {
      name: 'Project Tab Manager',
      summary:
        'A Chrome extension for grouping work by project instead of drowning in tab entropy.',
      href: 'https://github.com/amanmamgain9/project-tab-manager',
      label: 'View repo',
      tags: ['React', 'Chrome Extension API', 'Productivity'],
    },
    {
      name: 'Transformer Notes',
      summary:
        'A compact written exploration of attention mechanics and how model internals map to actual implementation choices.',
      href: 'mailto:amanmamgain9@gmail.com?subject=Share%20the%20transformer%20notes',
      label: 'Ask for it',
      tags: ['Writing', 'ML', 'Systems Thinking'],
    },
  ] satisfies ProjectEntry[],
  principles: [
    {
      title: 'Build tactile interfaces',
      body:
        'I like interfaces that feel intentional: clear rhythm, strong motion hierarchy, and transitions that explain structure instead of decorating it.',
    },
    {
      title: 'Own the full stack',
      body:
        'The interesting work usually lives in the seams between frontend, infra, data flow, and product constraints. I prefer owning those seams.',
    },
    {
      title: 'Prototype hard problems fast',
      body:
        'Games, workflow tools, AI products, browser-side media systems: I like bringing unclear ideas into a usable form quickly.',
    },
  ] satisfies PrincipleEntry[],
  links: {
    email: 'mailto:amanmamgain9@gmail.com',
    github: 'https://github.com/amanmamgain9',
    linkedin: 'https://linkedin.com/in/aman-mamgain-7729599b/',
    resume: '/aman.pdf',
  },
};
