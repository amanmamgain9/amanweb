import { ShowcaseItem } from '../types/showcase'
import styled from 'styled-components';

const DetailContainer = styled.div`
  padding: 2rem;
  overflow-y: auto;
  height: calc(100vh - 200px);
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
  border: 1px solid #00f0ff;
  padding: 0.75rem 1.5rem;
  font-size: 0.9em;

  &:hover {
    background-color: rgba(0, 240, 255, 0.1);
  }
`

interface ShowcaseDetailProps {
  item: ShowcaseItem
  onClose: () => void
}

export function ShowcaseDetail({ 
  item
}: ShowcaseDetailProps) {
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
      {item.date && (
        <TechTag>
          {new Date(item.date).toLocaleDateString()}
        </TechTag>
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
  )
}
