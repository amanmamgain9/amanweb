export type ExperienceEntry = {
  period: string;
  company: string;
  role?: string;
  summary?: string;
};

export type Project = {
  name: string;
  summary: string;
  image: string;
  href: string;
};

export const homeContent = {
  identity: {
    name: 'Aman Mamgain',
    greeting: "Hey, I'm Aman.",
    summary:
      "I'm a generalist software engineer. I've built 3D proximity voice chat for a first-person shooter, an iOS app for car showroom salespeople, and Django backends for loan approvals. After Glip I took a sabbatical, did contract work through Turing, and built a few products of my own.",
  },
  featuredProject: {
    name: 'PlayThisLife',
    summary: 'One planner for tasks, habits, workouts and chores, with an AI assistant that sets it up for you.',
    role: 'Founder. Designed, built and run by me.',
    href: 'https://playthislife.com',
    logo: '/playthislife-cat.svg',
    video: 'https://www.playthislife.com/product/how-it-works.mp4',
    poster: 'https://www.playthislife.com/product/how-it-works-poster.webp',
  },
  projects: [
    {
      name: 'Karaka',
      summary: 'A DeepSeek Harness fork for shipping agents inside your product.',
      image: '/project-karaka.webp',
      href: 'https://github.com/karaka-ai/karaka',
    },
    {
      name: 'AIAnkiPro',
      summary: 'Turns notes into flashcards.',
      image: '/project-aiankipro.webp',
      href: 'https://github.com/amanmamgain9/anki-ai-pro',
    },
    {
      name: 'PlanMyWorkDay',
      summary: 'A planner you can use without touching a mouse.',
      image: '/project-planmyworkday.webp',
      href: 'https://github.com/amanmamgain9/only-tasks',
    },
    {
      name: 'Rarely',
      summary: 'Make the pet photo talk.',
      image: '/project-rarely.webp',
      href: 'https://github.com/amanmamgain9/rarely-cards',
    },
  ] satisfies Project[],
  experiences: [
    {
      period: 'Recent',
      company: 'Turing',
      role: 'Contract engineer',
      summary: 'Built replicas of real web apps used to train AI computer-use agents.',
    },
    {
      period: '2025',
      company: 'Sabbatical',
    },
    {
      period: '2021 – 2024',
      company: 'Glip',
      role: 'Founding engineer',
      summary: 'Game capture app on OBS, crypto wallet and marketplace, proximity voice chat in a Unity shooter.',
    },
    {
      period: '2019 – 2021',
      company: 'Spinny',
      role: 'Tech lead',
      summary: 'Loan approval system with the ops team, and an iOS app for showroom sales teams.',
    },
    {
      period: '2014 – 2019',
      company: 'Back2Stores',
      role: 'Co-founder',
      summary: 'B2B commerce platform used by 30+ enterprise clients. Before that, Innovaccer and HT Media.',
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
