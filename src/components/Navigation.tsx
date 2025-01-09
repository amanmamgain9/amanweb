import { ShowcaseCategory } from '../types/showcase'
import styled from 'styled-components'

const Nav = styled.nav`
  width: 300px;
  background-color: rgba(13, 35, 57, 0.95);
  border-right: 1px solid #1c4c7c;
  padding: 1rem;
  overflow-y: auto;
`

const Header = styled.div`
  padding: 0.5rem 1rem;
  color: #58a6ff;
  font-size: 0.9em;
  border-bottom: 1px solid #1c4c7c;
  margin-bottom: 1rem;
`

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const ProjectItem = styled.button<{ $active?: boolean }>`
  background-color: ${props => props.$active ? 'rgba(28, 76, 124, 0.5)' : 'transparent'};
  color: ${props => props.$active ? '#00f0ff' : '#58a6ff'};
  border: none;
  padding: 1rem;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9em;
  text-align: left;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.$active ? '#1c4c7c' : 'transparent'};

  &:hover {
    background-color: rgba(28, 76, 124, 0.3);
    border-color: #1c4c7c;
  }
`

interface NavigationProps {
  activeCategory: ShowcaseCategory
  onCategoryChange: (category: ShowcaseCategory) => void
}

export function Navigation({ activeCategory, onCategoryChange }: NavigationProps) {
  const projects = [
    { id: 'projects', label: 'Featured Projects' },
    { id: 'articles', label: 'Technical Articles' },
    { id: 'thoughts', label: 'Developer Thoughts' }
  ]

  return (
    <Nav>
      <Header>PROJECT CATEGORIES</Header>
      <ProjectList>
        {projects.map(project => (
          <ProjectItem 
            key={project.id}
            $active={activeCategory === project.id}
            onClick={() => onCategoryChange(project.id as ShowcaseCategory)}
          >
            {project.label}
          </ProjectItem>
        ))}
      </ProjectList>
    </Nav>
  )
}
