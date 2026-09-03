export type ArticleEntry = {
  title: string;
  summary: string;
  source: 'On this site' | 'Substack' | 'DEV Community';
  publishedAt: string;
  publishedLabel: string;
  href: string;
  external: boolean;
};

export const articles: ArticleEntry[] = [
  {
    title: 'Attention is all you need',
    summary: 'Understanding the maths behind attention.',
    source: 'Substack',
    publishedAt: '2024-03-18',
    publishedLabel: '18 March 2024',
    href: 'https://amanmamgain.substack.com/p/attention-is-all-you-need',
    external: true,
  },
  {
    title: 'Keeping things DRY with Python Meta Programming',
    summary: 'Using a metaclass to generate repetitive GraphQL resolver methods.',
    source: 'DEV Community',
    publishedAt: '2020-02-11',
    publishedLabel: '11 February 2020',
    href: 'https://dev.to/amanmamgain9/keeping-things-dry-with-python-meta-programming-361i',
    external: true,
  },
];
