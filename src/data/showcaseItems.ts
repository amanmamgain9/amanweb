import { ShowcaseItem } from '../types/showcase'

export const showcaseItems: ShowcaseItem[] = [
  {
    id: 1,
    category: 'projects',
    title: 'Project Alpha',
    description: 'A sophisticated web application showcasing modern development practices and cutting-edge technologies.',
    technologies: ['React', 'TypeScript', 'Node.js'],
    link: '#',
    image: 'https://placehold.co/100x100/1c4c7c/58a6ff?text=P1'
  },
  {
    id: 2,
    category: 'projects',
    title: 'Project Beta',
    description: 'An innovative solution that pushes the boundaries of what\'s possible in web development.',
    technologies: ['Next.js', 'GraphQL', 'PostgreSQL'],
    link: '#',
    image: 'https://placehold.co/100x100/1c4c7c/58a6ff?text=P2'
  },
  {
    id: 3,
    category: 'articles',
    title: 'Modern Web Architecture',
    description: 'Exploring the latest trends and best practices in web application architecture.',
    date: '2024-01-15',
    link: '#',
    image: 'https://placehold.co/100x100/1c4c7c/58a6ff?text=A1'
  },
  {
    id: 4,
    category: 'thoughts',
    title: 'The Future of Development',
    description: 'Insights and predictions about where software development is heading in the coming years.',
    date: '2024-01-10',
    image: 'https://placehold.co/100x100/1c4c7c/58a6ff?text=T1'
  }
]
