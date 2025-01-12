import styled from 'styled-components';
import { Link } from 'react-router-dom';

const TopBarContainer = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(13, 35, 57, 0.95);
  padding: 0.75rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 240, 255, 0.1),
              0 8px 30px rgba(13, 35, 57, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(88, 166, 255, 0.1);
  margin: 1rem;
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    transform: none;
    width: 100%;
    margin: 0;
    border-radius: 12px 12px 0 0;
    padding: 1rem;
  }
`

const NavContainer = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-around;
    gap: 1rem;
  }
`

const NavButton = styled(Link)<{ $active?: boolean }>`
  text-decoration: none;
  background: transparent;
  color: ${props => props.$active ? '#00f0ff' : '#58a6ff'};
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-family: 'Press Start 2P';
  font-size: 0.7em;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #00f0ff;
    text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
  }

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: ${props => props.$active ? '100%' : '0'};
    height: 2px;
    background: #00f0ff;
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover:after {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.6em;
  }
`

interface NavbarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export function Navbar({ activePage, onPageChange }: NavbarProps) {
  const pages = ['HOME', 'PROJECTS', 'WDYGDTW'];
  
  console.log("activePage", activePage);
  return (
    <TopBarContainer>
      <NavContainer>
        {pages.map(page => (
          <NavButton
            key={page}
            $active={activePage === page}
            to={`/${page.toLowerCase()}`}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(page);
            }}
          >
            {page}
          </NavButton>
        ))}
      </NavContainer>
    </TopBarContainer>
  )
}
