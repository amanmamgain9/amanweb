import styled from 'styled-components';
import { getCurrentMonthDefault } from '../data/weekData';

const ListContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    cursor: default;
    height: 100%;
  }
`;

const FullImage = styled.img`
  width: 100%;
//   height: 100%;
  object-fit: cover;

  @media (max-width: 768px) {
    height: 100%;
  }
`;

const ButtonWrapper = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    position: absolute;
    left: 50%;
    bottom: 2rem;
    transform: translateX(-50%);
    z-index: 10;
  }
`;

const ActionButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(13, 35, 57, 0.95);
    border: 1px solid rgba(0, 240, 255, 0.6);
    color: #00f0ff;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Miso';
    font-size: 0.7em;
    backdrop-filter: blur(4px);
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 240, 255, 0.2);
    }
  }
`;

export function WDYGDTWList({ onWeekSelect }: { onWeekSelect: (weekId: string) => void }) {
  const handleClick = () => {
    const monthId = getCurrentMonthDefault();
    onWeekSelect(monthId);
  };

  const handleContainerClick = () => {
    // Only trigger on desktop
    if (window.innerWidth > 768) {
      handleClick();
    }
  };

  return (
    <ListContainer onClick={handleContainerClick}>
      <FullImage src="/wdygdtw.jpeg" alt="What Did You Get Done This Week" />
      <ButtonWrapper>
        <ActionButton onClick={handleClick}>
          View My Week
        </ActionButton>
      </ButtonWrapper>
    </ListContainer>
  );
}
