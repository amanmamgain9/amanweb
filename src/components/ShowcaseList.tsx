import { ShowcaseItem } from '../types/showcase'
import styled from 'styled-components'

const ListContainer = styled.div`
  width: 38.2%;
  padding: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(100vh - 200px);
  border-right: 1px solid #1c4c7c;
`

const ListContent = styled.div`
  overflow-y: auto;
  height: 100%;
`

const Card = styled.div`
  border: 1px solid #1c4c7c;
  padding: 1.5rem;
  background-color: rgba(13, 35, 57, 0.95);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #00f0ff;
    background-color: rgba(28, 76, 124, 0.3);
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const Title = styled.h3`
  font-size: 1.8em;
  color: #00f0ff;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '>';
    opacity: 0.7;
  }
`

const Image = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
`

const Description = styled.div`
  color: #e6edf3;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.9em;
`

const TechnologiesContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const TechTag = styled.span`
  background-color: rgba(0, 240, 255, 0.1);
  color: #00f0ff;
  padding: 0.25rem 0.75rem;
  font-size: 0.8em;
  border: 1px solid rgba(0, 240, 255, 0.2);
`

interface ShowcaseListProps {
  items: ShowcaseItem[]
  onItemSelect: (id: number) => void
}

export function ShowcaseList({ 
  items, 
  onItemSelect
}: ShowcaseListProps) {
  return (
    <ListContainer>
      <ListContent>
        {items.map(item => (
        <Card 
          key={item.id} 
          onClick={() => onItemSelect(item.id)}
        >
          <CardHeader>
            <Title>{item.title}</Title>
            <Image src={item.image} alt={item.title} />
          </CardHeader>
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
        </Card>
        ))}
      </ListContent>
    </ListContainer>
  )
}
