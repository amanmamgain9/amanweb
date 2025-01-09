import styled from 'styled-components'

const TopBarContainer = styled.div`
  background-color: rgba(13, 35, 57, 0.95);
  padding: 1rem;
  border-bottom: 1px solid #1c4c7c;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2em;
  color: #58a6ff;
`

const TitleDecoration = styled.span`
  color: #00f0ff;
  font-size: 0.8em;
  letter-spacing: 2px;
  opacity: 0.7;
`

const NavContainer = styled.div`
  display: flex;
  gap: 2rem;
`

const NavButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  color: ${props => props.$active ? '#00f0ff' : '#58a6ff'};
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1em;
  transition: color 0.2s ease;

  &:hover {
    color: #00f0ff;
  }
`

interface TopBarProps {
  title: string;
  activePage: string;
  onPageChange: (page: string) => void;
}

export function TopBar({ title, activePage, onPageChange }: TopBarProps) {
  const pages = ['HOME', 'PROJECTS', 'RANTS'];
  
  return (
    <TopBarContainer>
      <TitleContainer>
        <span>{title}</span>
        <TitleDecoration>////</TitleDecoration>
      </TitleContainer>
      <NavContainer>
        {pages.map(page => (
          <NavButton
            key={page}
            $active={activePage === page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </NavButton>
        ))}
      </NavContainer>
    </TopBarContainer>
  )
}
