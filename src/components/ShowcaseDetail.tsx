import { ShowcaseItem } from '../types/showcase'
import styled from 'styled-components'
import { useState, useEffect } from 'react'

const DetailContainer = styled.div<{ $isProjectsPage: boolean }>`
  width: ${props => props.$isProjectsPage ? '61.8%' : '100%'};
  padding: 2rem;
  overflow-y: auto;
  height: calc(100vh - 200px);
  transition: all 0.3s ease-in-out;
  opacity: 1;
  transform: translateX(0);

  &.entering {
    opacity: 0;
    transform: translateX(20px);
  }

  &.exiting {
    opacity: 0;
    transform: translateX(-20px);
  }

  @media (max-width: 768px) {
    width: 100%;
    border-top: 1px solid #1c4c7c;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #1c4c7c;
`

const DetailImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 4px;
`

const Title = styled.h3`
  color: #00f0ff;
  font-size: 1.8em;
  margin: 0;
`

const Description = styled.p`
  color: #e6edf3;
  line-height: 1.6;
  font-size: 0.9em;
  margin-bottom: 2rem;
`

const TechnologiesContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`

const TechTag = styled.span`
  background-color: rgba(0, 240, 255, 0.1);
  color: #00f0ff;
  padding: 0.25rem 0.75rem;
  font-size: 0.8em;
  border: 1px solid rgba(0, 240, 255, 0.2);
`

const ItemLink = styled.a`
  display: inline-block;
  margin-top: 1rem;
  color: #00f0ff;
  text-decoration: none;
  border: 1px solid #00f0ff;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s;
  font-size: 0.9em;

  &:hover {
    background-color: rgba(0, 240, 255, 0.1);
  }
`

interface ShowcaseDetailProps {
  item: ShowcaseItem
  onClose: () => void
  isProjectsPage: boolean
}

export function ShowcaseDetail({ item, isProjectsPage }: ShowcaseDetailProps) {
  const [transitionState, setTransitionState] = useState('entered')

  useEffect(() => {
    setTransitionState('entering')
    const timer = setTimeout(() => setTransitionState('entered'), 50)
    return () => clearTimeout(timer)
  }, [item.id])

  return (
    <DetailContainer 
      $isProjectsPage={isProjectsPage}
      className={transitionState}
    >
      <Header>
        <DetailImage src={item.image} alt={item.title} />
        <Title>{item.title}</Title>
      </Header>
      <Description>{item.description}</Description>
      {item.technologies && (
        <TechnologiesContainer>
          {item.technologies.map(tech => (
            <TechTag key={tech}>{tech}</TechTag>
          ))}
        </TechnologiesContainer>
      )}
      {item.date && (
        <TechTag>
          {new Date(item.date).toLocaleDateString()}
        </TechTag>
      )}
      {item.link && (
        <ItemLink 
          href={item.link} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          View {item.category === 'projects' ? 'Project' : item.category === 'articles' ? 'Article' : 'Post'} →
        </ItemLink>
      )}
    </DetailContainer>
  )
}
