import styled from 'styled-components'
import { showcaseItems } from '../data/showcaseItems'

// ---- Shared Styled Components ----
const BaseContainer = styled.div`
  padding: 1rem;
  overflow: hidden;
  height: calc(100vh - 200px);
  
`

// ---- List Components ----
const ListContainer = styled(BaseContainer)<{ $isVisible?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  opacity: ${props => props.$isVisible === false ? 0 : 1};
  transition: opacity 0.3s ease-in-out;
  @media (max-width: 768px) {
    height: calc(-123px + 100vh);
    overflow-y: hidden;
  }
`

const ListContent = styled.div`
  height: 100%;
  padding-top: 1rem;
  
  & > *:not(:last-child) {
    margin-bottom: 1rem;
    overflow-y: scroll;
    overscroll-behavior: contain;
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

// ---- Detail Components ----
const DetailContainer = styled(BaseContainer)`
  width: 100%;

  @media (max-width: 768px) {
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

const Title = styled.h3`
  color: #00f0ff;
  font-size: 1.5em;
  margin: 0;
  line-height: 1.2;

  &::before {
    content: '>';
    opacity: 0.7;
    margin-right: 0.5rem;
  }
`

const Description = styled.p`
  color: #e6edf3;
  line-height: 1.6;
  font-size: 1em;
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
  border-radius: 4px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgba(0, 240, 255, 0.15);
  }
`

const LinksContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`

const ItemLink = styled.a`
  display: inline-block;
  color: #00f0ff;
  text-decoration: none;
  background: linear-gradient(45deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05));
  border: 1px solid rgba(0, 240, 255, 0.3);
  padding: 0.75rem 1.5rem;
  font-size: 0.9em;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 240, 255, 0.1),
              inset 0 0 0 rgba(0, 240, 255, 0);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(0, 240, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  &:hover {
    background: linear-gradient(45deg, rgba(0, 240, 255, 0.15), rgba(0, 240, 255, 0.1));
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 240, 255, 0.2),
                inset 0 0 20px rgba(0, 240, 255, 0.1);
    border-color: rgba(0, 240, 255, 0.5);
    
    &:before {
      transform: translateX(100%);
    }
  }
`

// ---- Component Interfaces ----
interface ShowcaseListProps {
  onItemSelect: (title: string) => void;
  isVisible?: boolean;
}

interface ShowcaseDetailProps {
  selectedId?: string;
}

// ---- Component Exports ----
export function ShowcaseList({ onItemSelect, isVisible }: ShowcaseListProps) {
  return (
    <ListContainer $isVisible={isVisible}>
      <ListContent>
        {showcaseItems.map(item => (
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
  );
}

export function ShowcaseDetail({ selectedId }: ShowcaseDetailProps) {
  const item = showcaseItems.find(item => item.slug === selectedId);

  if (!item) return null;
  return (
    <DetailContainer>
      <Header>
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
      {item.links && item.links.length > 0 && (
        <LinksContainer>
          {item.links.map((link, index) => (
            <ItemLink
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label} →
            </ItemLink>
          ))}
        </LinksContainer>
      )}
    </DetailContainer>
  );
}
