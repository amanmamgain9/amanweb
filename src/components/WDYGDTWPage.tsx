import { useState } from 'react'
import styled from 'styled-components'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { weekData, isDateInWeeks } from '../data/weekData'

const ListContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  display: flex;
  flex: 1;
  
  &:hover {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 240, 255, 0.1);
      transition: background 0.2s ease;
    }
  }
`

const FullImage = styled.img`
  width: 100%;
  object-fit: cover;
  display: block;
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
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(13, 35, 57, 0.95);
  }
  
  &::-webkit-scrollbar-thumb {
    background: #1c4c7c;
    border-radius: 4px;
  }
`

const Title = styled.h1`
  color: #00f0ff;
  text-align: center;
  font-size: 2em;
  margin-bottom: 1rem;
`

const CalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    background: rgba(13, 35, 57, 0.95);
    border: 1px solid #1c4c7c;
    border-radius: 8px;
    font-size: 0.85em;
    padding: 0.75rem;
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
    
    button {
      color: #00f0ff;
      border-radius: 4px;
      transition: all 0.2s ease;
      font-weight: 500;
      background: rgba(28, 76, 124, 0.2);
      margin: 2px;
      
      &:hover:not(:disabled) {
        background-color: rgba(0, 240, 255, 0.2);
        transform: scale(1.05);
      }

      &:disabled {
        color: rgba(255, 255, 255, 0.2);
        background-color: rgba(13, 35, 57, 0.8);
        cursor: not-allowed;
        opacity: 1;
        text-decoration: line-through;
      }
    }
    
    .react-calendar__tile {
      padding: 0.5em 0.25em;
      
      &--active {
        background: rgba(0, 240, 255, 0.3) !important;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        font-weight: bold;
      }
      
      &--now {
        background: rgba(0, 240, 255, 0.15);
        border: 2px solid rgba(0, 240, 255, 0.5);
      }
    }
    
    .react-calendar__month-view__days__day--weekend {
      color: #ff6b6b;
      
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
        margin: 0 2px;
        
        &:disabled {
          background: rgba(13, 35, 57, 0.8);
          opacity: 0.5;
        }
        
        &:hover:not(:disabled) {
          background-color: rgba(0, 240, 255, 0.2);
        }
      }
    }

    .react-calendar__month-view__weekdays {
      font-size: 0.8em;
      text-transform: uppercase;
      font-weight: bold;
      color: #00f0ff;
      margin-bottom: 0.5em;
      
      abbr {
        text-decoration: none;
        border: none;
      }
    }
    
    .react-calendar__year-view__months {
      // gap: 0.25rem;
      gap: 0 2.5rem ;
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

const WeekEntry = styled.div`
  border: 1px solid #1c4c7c;
  border-radius: 8px;
  background: rgba(13, 35, 57, 0.95);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 240, 255, 0.2);
  }

  h3 {
    color: #00f0ff;
    margin: 0;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &::after {
      content: '▼';
      font-size: 0.8em;
      transition: transform 0.3s ease;
      transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'rotate(0)'};
    }
  }
`

const WeekContent = styled.div`
  color: #58a6ff;
  line-height: 1.5;
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid #1c4c7c;
  margin-top: 0;
  overflow: hidden;
  max-height: ${props => props.$isExpanded ? '500px' : '0'};
  opacity: ${props => props.$isExpanded ? '1' : '0'};
  transition: all 0.3s ease;
  padding: ${props => props.$isExpanded ? '1rem' : '0 1rem'};
`


export function WDYGDTWList({ onWeekSelect }: { onWeekSelect: (weekId: number) => void }) {
  return (
    <ListContainer onClick={() => onWeekSelect(1)}>
      <FullImage src="/wdygdtw.jpeg" alt="What Did You Get Done This Week" />
    </ListContainer>
  )
}

export function WDYGDTWContent({ weekId }: { weekId: number }) {
  const [currentMonth, setCurrentMonth] = useState('January 2025')
  const [date, setDate] = useState(new Date())
  
  return (
    <ContentContainer>
      <Title>What Did You Get Done This Week?</Title>
      
      <CalendarWrapper>
        <Calendar 
          onChange={(newDate: Date) => {
            if (isDateInWeeks(newDate, weekData)) {
              setDate(newDate)
              setCurrentMonth(newDate.toLocaleString('default', { month: 'long', year: 'numeric' }))
            }
          }}
          value={date}
          maxDetail="year"
          minDetail="month"
          showNavigation={true}
          view="year"
          tileDisabled={({date}) => !isDateInWeeks(date, weekData)}
        />
      </CalendarWrapper>

      <WeeksContainer>
        {weekData[currentMonth]?.weeks.map((week, index) => {
          const [isExpanded, setIsExpanded] = useState(false);
          return (
            <WeekEntry 
              key={index} 
              onClick={() => setIsExpanded(!isExpanded)}
              $isExpanded={isExpanded}
            >
              <h3>Week {index + 1} ({week.dates})</h3>
              <WeekContent $isExpanded={isExpanded}>
                {week.content}
              </WeekContent>
            </WeekEntry>
          );
        })}
      </WeeksContainer>
    </ContentContainer>
  )
}
