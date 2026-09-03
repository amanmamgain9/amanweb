export type ExperienceEntry = {
  id: string;
  period: string;
  company: string;
  role: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export type ProjectStatus = 'Live' | 'Launching soon';

export type FeaturedProject = {
  name: string;
  status: ProjectStatus;
  summary: string;
  image: string;
  href?: string;
};

export const homeContent = {
  identity: {
    name: 'Aman Mamgain',
  },
  featuredProjects: [
    {
      name: 'Karaka',
      status: 'Live',
      summary: 'A DeepSeek Harness fork that allows you to ship production agents inside your product.',
      image: '/project-karaka.webp',
      href: 'https://github.com/karaka-ai/karaka',
    },
    {
      name: 'PlanMyWorkday',
      status: 'Live',
      summary: 'Task management as fast as your brain.',
      image: '/project-planmyworkday.webp',
      href: 'https://planmyworkday.com',
    },
    {
      name: 'AIAnkiPro',
      status: 'Live',
      summary: 'Turn scattered input into lasting recall.',
      image: '/project-aiankipro.webp',
      href: 'https://aiankipro.com',
    },
    {
      name: 'Rarely',
      status: 'Launching soon',
      summary: 'Make the pet photo talk.',
      image: '/project-rarely.webp',
    },
    {
      name: 'PadelCue',
      status: 'Launching soon',
      summary: 'One court cue. Better padel.',
      image: '/project-padelcue.webp',
    },
  ] satisfies FeaturedProject[],
  experiences: [
    {
      id: 'independent-products',
      period: '2025 — now',
      company: 'Independent products',
      role: 'Product engineer and founder',
      summary: 'Taking focused products from rough idea to production.',
      highlights: [
        'Shipped PlanMyWorkday, AIAnkiPro, and the first public version of Karaka.',
        'Building consumer AI, learning, and mobile coaching products toward launch.',
      ],
      stack: ['Product strategy', 'TypeScript', 'React', 'AI systems'],
    },
    {
      id: 'glip',
      period: '2021 — 2024',
      company: 'Glip',
      role: 'Founding engineer',
      summary: 'Built product systems across desktop, web, and Unity.',
      highlights: [
        'Developed low-latency game capture in Electron using OBS APIs.',
        'Built wallet, auction, reward, gameplay, voice-chat, and AI-character experiences.',
      ],
      stack: ['Electron', 'React', 'Node.js', 'Unity', 'C#'],
    },
    {
      id: 'spinny',
      period: '2019 — 2021',
      company: 'Spinny',
      role: 'Tech lead',
      summary: 'Led full-stack delivery for vehicle-finance operations.',
      highlights: [
        'Built a React Native client-management app and loan-automation backend.',
        'Designed dynamic profiling and loan-approval workflows.',
      ],
      stack: ['Django', 'React', 'React Native', 'Workflow systems'],
    },
    {
      id: 'earlier-work',
      period: '2014 — 2019',
      company: 'Back2Stores · Innovaccer · HT Media',
      role: 'Co-founder, SDE-2, and software developer',
      summary: 'Built commerce, healthcare, and media systems from product UI to infrastructure.',
      highlights: [
        'Scaled a B2B commerce platform to more than 30 enterprise clients.',
        'Unified healthcare workflows and shipped growth, payment, analytics, and internal systems.',
      ],
      stack: ['Django', 'Android', 'Angular', 'AWS', 'Elasticsearch'],
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
