export interface ShowcaseItem {
  id: number
  category: ShowcaseCategory
  title: string
  description: string
  technologies?: string[]
  link?: string
  image: string
  date?: string
}

export type ShowcaseCategory = 'projects' | 'articles' | 'thoughts' | 'about'

export type NavigationPage = 'HOME' | 'PROJECTS' | 'RANTS'

export interface NavigationItem {
  id: ShowcaseCategory
  label: string
}
