import { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { WeekEntry as WeekDataType, MonthData, weekData, isDateInWeeks, getCurrentMonthDefault, getOriginalMonthFormat } from '../data/weekData'

// Base styles for common colors and transitions
const baseTheme = {
  primary: '#00f0ff',
  background: 'rgba(13, 35, 57, 0.95)',
  border: '#1c4c7c',
  weekend: '#ff6b6b',
  hoverTransition: 'all 0.2s ease'
}

const ListContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  display: flex;
  flex: 1;
  max-height: calc(100vh - 64px);
  overflow: hidden;

  @media (max-width: 768px) {
    height: calc(100vh - 64px);
  }
  
  &:hover::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 240, 255, 0.1);
    transition: ${baseTheme.hoverTransition};
  }
`

const FullImage = styled.img`
  width: 100%;
  object-fit: cover;
`

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

const CalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    background: ${baseTheme.background};
    border: 1px solid ${baseTheme.border};
    border-radius: 8px;
    font-size: 0.85em;
    padding: 0.75rem;
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
    
    button {
      color: ${baseTheme.primary};
      border-radius: 4px;
      transition: ${baseTheme.hoverTransition};
      font-weight: 500;
      background: rgba(28, 76, 124, 0.2);
      margin: 2px;
      
      &:hover:not(:disabled) {
        background-color: rgba(0, 240, 255, 0.2);
        transform: scale(1.05);
      }

      &:disabled {
        color: rgba(255, 255, 255, 0.2);
        background-color: ${baseTheme.background};
        cursor: not-allowed;
        opacity: 1;
        text-decoration: line-through;
      }

      &:focus {
        outline: 2px solid ${baseTheme.primary};
        outline-offset: 2px;
      }
    }
    
    .react-calendar__tile {
      padding: 0.5em 0.25em;
      
      &--active {
        background: rgba(0, 240, 255, 0.3) !important;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
      }
      
      &--now {
        background: rgba(0, 240, 255, 0.15);
        border: 2px solid rgba(0, 240, 255, 0.5);
      }
    }
    
    .react-calendar__month-view__days__day--weekend {
      color: ${baseTheme.weekend};
      
      &:disabled {
        color: rgba(255, 107, 107, 0.4);
      }
    }

    .react-calendar__navigation {
      height: 40px;
      margin-bottom: 1em;
      
      button {
        min-width: 40px;
        background: rgba(28, 76, 124, 0.3);
        font-size: 1.2em;
        
        &:disabled {
          background: ${baseTheme.background};
          opacity: 0.5;
        }
      }
    }

    .react-calendar__month-view__weekdays {
      font-size: 0.8em;
      text-transform: uppercase;
      font-weight: bold;
      color: ${baseTheme.primary};
      margin-bottom: 0.5em;
      
      abbr {
        text-decoration: none;
        border: none;
      }
    }
    
    .react-calendar__year-view__months {
      gap: 0 2.5rem;
      padding: 0 0.25rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      
      button {
        padding: 0.75em 0.25em;
        font-size: 0.95em;
        margin: 0.1rem;
      }
    }
  }
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

const DetailWrapper = styled(motion.div)`
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
    <DetailWrapper
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
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

export function WDYGDTWList({ onWeekSelect }: { onWeekSelect: (weekId: string) => void }) {
  const handleClick = () => {
    const monthId = getCurrentMonthDefault(); // Will return "jan-2025"
    onWeekSelect(monthId);
  }

  return (
    <ListContainer onClick={handleClick}>
      <FullImage src="/wdygdtw.jpeg" alt="What Did You Get Done This Week" />
    </ListContainer>
  )
}

const MainContentWrapper = styled.div<{ $isDetailView: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.3s ease-out;
  
  ${props => props.$isDetailView && `
    filter: blur(5px);
    opacity: 0;
    transform: scale(0.95);
    pointer-events: none;
  `}
`;

export function WDYGDTWContent({ weekId, onFocusSelect }: { weekId: string, onFocusSelect: (id: string) => void }) {
  const [date, setDate] = useState(new Date())
  const [expandedWeekIndex, setExpandedWeekIndex] = useState<number | null>(null)
  const [showingDetail, setShowingDetail] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<{ week: WeekDataType; index: number } | null>(null)
  
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
    setSelectedWeek({ week, index });
    setShowingDetail(true);
    onFocusSelect(weekId);
  }

  const handleCloseDetail = () => {
    setShowingDetail(false);
    setSelectedWeek(null);
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
      
      <AnimatePresence>
        {selectedWeek && (
          <WeekDetail 
            week={selectedWeek.week}
            weekNumber={selectedWeek.index + 1}
            onClose={handleCloseDetail}
          />
        )}
      </AnimatePresence>
    </ContentContainer>
  )
}
