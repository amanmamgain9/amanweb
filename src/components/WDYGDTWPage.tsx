import { useState } from 'react'
import styled from 'styled-components'
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

const WeekItemButton = styled.button`
  width: 100%;
  text-align: left;
  border: 1px solid ${baseTheme.border};
  border-radius: 8px;
  background: ${baseTheme.background};
  cursor: pointer;
  transition: ${baseTheme.hoverTransition};
  padding: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 240, 255, 0.2);
  }

  &:focus {
    outline: 2px solid ${baseTheme.primary};
    outline-offset: 2px;
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
  color: #58a6ff;
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
}

const WeekItem = ({ week, index, isExpanded, onToggle }: WeekItemProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    }
  }

  return (
    <WeekItemButton 
      onClick={onToggle}
      onKeyPress={handleKeyPress}
    >
      <WeekHeader $isExpanded={isExpanded}>
        Week {index + 1} ({week.dates})
      </WeekHeader>
      <WeekContent $isExpanded={isExpanded}>
        {week.content}
      </WeekContent>
    </WeekItemButton>
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

export function WDYGDTWContent({ weekId }: { weekId: string }) {
  const [date, setDate] = useState(new Date())
  const [expandedWeekIndex, setExpandedWeekIndex] = useState<number | null>(null)
  
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

  return (
    <ContentContainer>
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
          />
          ))
        )}
      </WeeksContainer>
    </ContentContainer>
  )
}
