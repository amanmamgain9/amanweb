import styled from 'styled-components'

const TopBarContainer = styled.div`
  background-color: rgba(13, 35, 57, 0.95);
  padding: 1rem;
  border-bottom: 1px solid #1c4c7c;
  display: flex;
  justify-content: center;
  align-items: center;
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
  activePage: string;
  onPageChange: (page: string) => void;
}

export function TopBar({ activePage, onPageChange }: TopBarProps) {
  const pages = ['HOME', 'PROJECTS', 'RANTS'];
  
  return (
    <TopBarContainer>
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
