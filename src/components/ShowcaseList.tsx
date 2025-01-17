import styled from 'styled-components'
import { useShowcase } from '../context/ShowcaseContext'

const ListContainer = styled.div<{ $isVisible?: boolean }>`
  padding: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(100vh - 200px);
  opacity: ${props => props.$isVisible === false ? 0 : 1};
  transition: opacity 0.3s ease-in-out;
`

const ListContent = styled.div`
  overflow-y: auto;
  height: 100%;
  padding-top: 1rem;
  
  /* Add spacing between cards */
  & > *:not(:last-child) {
    margin-bottom: 1rem;
  }
`

const Card = styled.div`
  height: 140px;
  border: 1px solid #1c4c7c;
  padding: 1.25rem;
  background-color: rgba(13, 35, 57, 0.95);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    border-color: #00f0ff;
    background-color: rgba(28, 76, 124, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 240, 255, 0.1);
  }
`

const Title = styled.h3`
  font-size: 1.5em;
  color: #00f0ff;
  margin: 0;
  line-height: 1.2;

  &::before {
    content: '>';
    opacity: 0.7;
    margin-right: 0.5rem;
  }
`

const TechnologiesContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-top: auto;
`

const TechTag = styled.span`
  background-color: rgba(0, 240, 255, 0.1);
  color: #00f0ff;
  padding: 0.25rem 0.75rem;
  font-size: 0.8em;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 4px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgba(0, 240, 255, 0.15);
  }
`

interface ShowcaseListProps {
  onItemSelect: (title: string) => void;
  isVisible?: boolean;
}

export function ShowcaseList({ 
  onItemSelect,
  isVisible
}: ShowcaseListProps) {
  const { items } = useShowcase();
  
  if (!items) return null;
  return (
    <ListContainer $isVisible={isVisible}>
      <ListContent>
        {items.map(item => (
        <Card key={item.title} onClick={() => onItemSelect(item.slug)}>
          <Title>{item.title}</Title>
          <TechnologiesContainer>
            {item.technologies?.map(tech => (
              <TechTag key={tech}>{tech}</TechTag>
            ))}
          </TechnologiesContainer>
        </Card>
        ))}
      </ListContent>
    </ListContainer>
  )
}
