import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { WeekEntry as WeekDataType, weekData, isDateInWeeks, getCurrentMonthDefault, getOriginalMonthFormat } from '../data/weekData';
import {baseTheme, CalendarWrapper} from '../libs/calendarStyles';
import { WDYGDTWList } from './WDYGDTWList';
// Base styles for common colors and transitions
export { WDYGDTWList };





const ContentContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
    &-track { background: ${baseTheme.background}; }
    &-thumb {
      background: ${baseTheme.border};
      border-radius: 4px;
    }
  }
`

const Title = styled.h1`
  color: ${baseTheme.primary};
  text-align: center;
  font-size: 2em;
  margin-bottom: 1rem;
`


const WeeksContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const WeekItemContainer = styled.div`
  width: 100%;
  text-align: left;
  border: 1px solid ${baseTheme.border};
  border-radius: 8px;
  background: ${baseTheme.background};
  transition: ${baseTheme.hoverTransition};
  padding: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 240, 255, 0.2);
  }
`

const WeekHeader = styled.div<{ $isExpanded: boolean }>`
  color: ${baseTheme.primary};
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.17em;
  font-weight: bold;
  
  &::after {
    content: '▼';
    font-size: 0.8em;
    transition: transform 0.3s ease;
    transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'rotate(0)'};
  }
`

const WeekContent = styled.div<{ $isExpanded: boolean }>`
  color: #b3e5fc;
  line-height: 1.5;
  border-top: 1px solid ${baseTheme.border};
  overflow: hidden;
  max-height: ${props => props.$isExpanded ? '500px' : '0'};
  opacity: ${props => props.$isExpanded ? '1' : '0'};
  transition: all 0.3s ease;
  padding: ${props => props.$isExpanded ? '1rem' : '0 1rem'};
`

interface WeekItemProps {
  week: WeekDataType;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onViewDetail: () => void;
}

interface WeekDetailProps {
  week: WeekDataType;
  weekNumber: number;
  onClose: () => void;
}

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
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${baseTheme.border};
`;

const WeekDetail = ({ week, weekNumber, onClose }: WeekDetailProps) => {
  return (
    <DetailWrapper>
      <DetailHeader>
        <Title style={{ margin: 0 }}>{week.dates}</Title>
        <BackToListButton onClick={onClose}>
          {`<`} Close
        </BackToListButton>
      </DetailHeader>
      <div>
        <h3 style={{ 
          color: '#00f0ff', 
          marginBottom: '1rem',
          fontSize: '1.2em',
          fontWeight: 'normal' 
        }}>
          {week.dates}
        </h3>
        <p style={{ 
          color: '#b3e5fc', 
          lineHeight: 1.8,
          fontSize: '1.1em'
        }}>
          {week.content}
        </p>
      </div>
    </DetailWrapper>
  );
}

const ViewDetailButton = styled.button`
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: #00f0ff;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  margin-left: auto;
  display: block;
  transition: all 0.2s ease;
  font-family: 'Press Start 2P';
  font-size: 0.7em;

  &:hover {
    background: rgba(0, 240, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const WeekItem = ({ week, index, isExpanded, onToggle, onViewDetail }: WeekItemProps) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle();
  }

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetail();
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }


  return (
    <WeekItemContainer>
      <WeekHeader 
        $isExpanded={isExpanded}
        onClick={handleToggle}
        style={{ cursor: 'pointer' }}
      >
        <span>Week {index + 1} ({week.dates})</span>
      </WeekHeader>
      <WeekContent $isExpanded={isExpanded}>
        <div>
          {week.content}
        </div>
        <ViewDetailButton onClick={handleViewDetail}>
          View Full Details →
        </ViewDetailButton>
      </WeekContent>
    </WeekItemContainer>
  )
}



const MainContentWrapper = styled.div<{ $isDetailView: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  display: ${props => props.$isDetailView ? 'none' : 'block'};
`;

export function WDYGDTWContent({ 
  onFocusSelect,
  onUnsetFocus,
  pathname
}: { 
  onFocusSelect: (id: string) => void;
  onUnsetFocus: () => void;
  pathname: string;
}) {
  const [weekId, setWeekId] = useState('');
  const [date, setDate] = useState(new Date())
  const [expandedWeekIndex, setExpandedWeekIndex] = useState<number | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<{ week: WeekDataType; index: number } | null>(null)
  const [showingDetail, setShowingDetail] = useState(false)

  useEffect(() => {
    const pathParts = pathname.split('/');
    const monthId = pathParts[2];
    const weekNum = pathParts[3];
    
    if (monthId) {
      setWeekId(weekNum ? `${monthId}/${weekNum}` : monthId);
      
      const monthYear = getOriginalMonthFormat(monthId);
      const currentMonthData = monthYear ? weekData[monthYear]?.weeks || [] : [];
      
      if (weekNum && currentMonthData.length > 0) {
        const weekIndex = parseInt(weekNum) - 1;
        if (weekIndex >= 0 && weekIndex < currentMonthData.length) {
          setSelectedWeek({
            week: currentMonthData[weekIndex],
            index: weekIndex
          });
          setShowingDetail(true);
        }
      } else {
        setSelectedWeek(null);
        setShowingDetail(false);
      }
    } else {
      setWeekId(getCurrentMonthDefault());
    }
  }, [pathname]);
  
  // Convert weekId (jan-2025) back to format needed for weekData ("January 2025")
  const monthYear = getOriginalMonthFormat(weekId);
  const currentMonthData = weekData[monthYear]?.weeks || [];

  const handleDateChange = (value: Date | null) => {
    if (value && isDateInWeeks(value, weekData)) {
      setDate(value)
      setExpandedWeekIndex(null)
    }
  }


  const handleWeekToggle = (index: number) => {
    setExpandedWeekIndex(expandedWeekIndex === index ? null : index)
  }

  const handleShowDetail = (week: WeekDataType, index: number) => {
    onFocusSelect(`${weekId}/${index + 1}`);
  }

  return (
    <ContentContainer>
      <MainContentWrapper $isDetailView={showingDetail}>
        <Title>What Did You Get Done This Week?</Title>
        
        <CalendarWrapper>
          <Calendar 
            onChange={handleDateChange}
            value={date}
            maxDetail="year"
            minDetail="month"
            showNavigation={true}
            view="year"
            tileDisabled={({date}) => !isDateInWeeks(date, weekData)}
          />
        </CalendarWrapper>

        <WeeksContainer>
          {currentMonthData.length === 0 ? (
            <div style={{ textAlign: 'center', color: baseTheme.primary }}>
              No entries available for {monthYear}
            </div>
          ) : (
            currentMonthData.map((week, index) => (
            <WeekItem
              key={index}
              week={week}
              index={index}
              isExpanded={expandedWeekIndex === index}
              onToggle={() => handleWeekToggle(index)}
              onViewDetail={() => handleShowDetail(week, index)}
            />
            ))
          )}
        </WeeksContainer>
      </MainContentWrapper>
      
      {selectedWeek && showingDetail && (
        <WeekDetail 
          week={selectedWeek.week}
          weekNumber={selectedWeek.index + 1}
          onClose={() => onUnsetFocus()}
        />
      )}
    </ContentContainer>
  )
}
