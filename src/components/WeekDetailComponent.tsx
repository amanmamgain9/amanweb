import styled from 'styled-components';
import { baseTheme } from '../libs/calendarStyles';

const DetailWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2rem;
  background: rgba(13, 35, 57, 0.98);
  z-index: 1000;
  overflow-y: auto;
  font-family: 'Press Start 2P', cursive;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${baseTheme.border};
`;

const Title = styled.h1`
  color: ${baseTheme.primary};
  text-align: center;
  font-size: 1.2em;
  margin: 0;
  font-family: 'Press Start 2P';
  
  @media (max-width: 768px) {
    display: none;
  }
`;


const MobileTitle = styled.h1`
  color: ${baseTheme.primary};
  text-align: center;
  font-size: 1.2em;
  margin: 0;
  font-family: 'Press Start 2P';
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const BackToListButton = styled.button`
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: #00f0ff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Press Start 2P';
  margin-bottom: 1rem;
  
  &:hover {
    background: rgba(0, 240, 255, 0.2);
  }
`;


const ScoreboardContainer = styled.div`
  background: #000;
  border: 4px solid #00f0ff;
  padding: 1rem;
  margin: 2rem 0;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
`;

const ScoreRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 2px solid rgba(0, 240, 255, 0.2);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ScoreLabel = styled.span`
  color: #00f0ff;
  font-size: 0.8em;
`;

const ScoreValue = styled.span`
  color: #fff;
  font-size: 0.8em;
`;

const HighlightsContainer = styled.div`
  background: #000;
  border: 4px solid #ffd700;
  padding: 1rem;
  margin: 2rem 0;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
`;



const HighlightItem = styled.div`
  color: rgba(255, 215, 0, 0.9);
  font-size: 0.8em;
  padding: 0.75rem 0;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
  
  &:last-child {
    border-bottom: none;
  }

  a {
    color: inherit;
    text-decoration: underline;
    
    &:hover {
      color: #ffd700;
      text-decoration: none;
    }
  }
`;

const HighlightContent = styled.span`
  margin-left: 0.5em;
`;

interface WeekDetailProps {
  week: {
    dates: string;
    highlights: string[];
    details: {
      hoursWorked: number;
      gymDays: number;
      averageSteps: string;
      weight: number;
    };
  };
  onClose: () => void;
}

const WeekDetail = ({ week, onClose }: WeekDetailProps) => {
  return (
    <DetailWrapper>
      <DetailHeader>
        <Title>{week.dates} Scoreboard</Title>
        <BackToListButton onClick={onClose}>
          {`<`} Close
        </BackToListButton>
      </DetailHeader>
      <MobileTitle>{week.dates} Scoreboard</MobileTitle>
      <ScoreboardContainer>
        <ScoreRow>
          <ScoreLabel>HOURS WORKED</ScoreLabel>
          <ScoreValue>{week.details.hoursWorked}</ScoreValue>
        </ScoreRow>
        <ScoreRow>
          <ScoreLabel>GYM DAYS</ScoreLabel>
          <ScoreValue>{week.details.gymDays}</ScoreValue>
        </ScoreRow>
        <ScoreRow>
          <ScoreLabel>AVG STEPS PER DAY</ScoreLabel>
          <ScoreValue>{week.details.averageSteps}</ScoreValue>
        </ScoreRow>
        <ScoreRow>
          <ScoreLabel>WEIGHT</ScoreLabel>
          <ScoreValue>{week.details.weight} Kg</ScoreValue>
        </ScoreRow>
      </ScoreboardContainer>

      <HighlightsContainer>
        {week.highlights.map((highlight, index) => (
          <HighlightItem key={index}>
            <span>★</span>
            <HighlightContent dangerouslySetInnerHTML={{ __html: highlight }} />
          </HighlightItem>
        ))}
      </HighlightsContainer>
    </DetailWrapper>
  );
};

export { WeekDetail };

