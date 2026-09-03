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
  detail: string;
  image: string;
  href?: string;
  tags: string[];
};

export type WorkInProgress = {
  name: string;
  status: 'Available now' | 'In development';
  summary: string;
  href?: string;
};

export const homeContent = {
  identity: {
    name: 'Aman Mamgain',
  },
  featuredProjects: [
    {
      name: 'PlanMyWorkday',
      status: 'Live',
      summary: 'Task management as fast as your brain.',
      detail:
        'A keyboard-first daily planner with a built-in focus timer and a deliberately low-friction workflow.',
      image: '/project-planmyworkday.webp',
      href: 'https://planmyworkday.com',
      tags: ['Product design', 'Full-stack web', 'Subscriptions'],
    },
    {
      name: 'Karaka',
      status: 'Live',
      summary: 'A persistent runtime for multi-agent applications.',
      detail:
        'An open-source application runtime built on DeepSeek Harness, with durable agents and server-to-server integration.',
      image: '/plugin-landscape-social.png',
      href: 'https://github.com/amanmamgain9/karaka',
      tags: ['Agent runtime', 'Open source', 'DeepSeek Harness'],
    },
    {
      name: 'AIAnkiPro',
      status: 'Live',
      summary: 'Turn scattered input into lasting recall.',
      detail:
        'Transforms notes, videos, and AI chats into a learn-first flashcard loop with recall, card chat, and voice.',
      image: '/project-aiankipro.webp',
      href: 'https://aiankipro.com',
      tags: ['Learning systems', 'Applied AI', 'Voice'],
    },
    {
      name: 'Rarely',
      status: 'Launching soon',
      summary: 'Make the pet photo talk.',
      detail:
        'A consumer product that turns one pet photo and a short line into a synchronized talking-pet video.',
      image: '/project-rarely.webp',
      tags: ['Generative video', 'Payments', 'Consumer AI'],
    },
    {
      name: 'PadelCue',
      status: 'Launching soon',
      summary: 'One court cue. Better padel.',
      detail:
        'An Android-first coaching app with daily tips, drills, saved playbooks, progress, and reminders.',
      image: '/project-padelcue.webp',
      tags: ['React Native', 'Firebase', 'Android'],
    },
  ] satisfies FeaturedProject[],
  workInProgress: [
    {
      name: 'Coursyn',
      status: 'In development',
      summary: 'AI-generated courses built as explorable learning systems.',
    },
    {
      name: 'Founder Game',
      status: 'In development',
      summary: 'A progression system that turns founder work into quests, skills, and momentum.',
    },
  ] satisfies WorkInProgress[],
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
