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
    max-width: 300px;
    margin: 0 auto;
    background: rgba(13, 35, 57, 0.95);
    border: 1px solid #1c4c7c;
    border-radius: 8px;
    font-size: 0.9em;
    padding: 1rem;
    
    button {
      color: #00f0ff;
      border-radius: 4px;
      transition: all 0.2s ease;
      
      &:hover:not(:disabled) {
        background-color: rgba(0, 240, 255, 0.1);
        transform: scale(1.05);
      }

      &:disabled {
        color: rgba(0, 240, 255, 0.1);
        background-color: rgba(13, 35, 57, 0.5);
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
    
    .react-calendar__tile {
      padding: 0.75em 0.5em;
      
      &--active {
        background: rgba(0, 240, 255, 0.2) !important;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
      }
      
      &--now {
        background: rgba(0, 240, 255, 0.05);
        border: 1px solid rgba(0, 240, 255, 0.3);
      }
    }
    
    .react-calendar__month-view__days__day--weekend {
      color: #ff6b6b;
      
      &:disabled {
        color: rgba(255, 107, 107, 0.3);
      }
    }

    .react-calendar__navigation {
      height: 40px;
      margin-bottom: 1em;
      
      button {
        min-width: 40px;
        background: none;
        font-size: 1.2em;
        
        &:disabled {
          opacity: 0.3;
        }
        
        &:hover:not(:disabled) {
          background-color: rgba(0, 240, 255, 0.1);
        }
      }
    }

    .react-calendar__month-view__weekdays {
      font-size: 0.8em;
      text-transform: uppercase;
      font-weight: bold;
      color: rgba(0, 240, 255, 0.7);
      
      abbr {
        text-decoration: none;
        border: none;
      }
    }
    
    .react-calendar__year-view__months {
      gap: 0.5rem;
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
  padding: 1.5rem;
  background: rgba(13, 35, 57, 0.95);

  h3 {
    color: #00f0ff;
    margin: 0 0 1rem 0;
    border-bottom: 1px solid #1c4c7c;
    padding-bottom: 0.5rem;
  }

  p {
    color: #58a6ff;
    margin: 0;
    line-height: 1.5;
  }
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
        {weekData[currentMonth]?.weeks.map((week, index) => (
          <WeekEntry key={index}>
            <h3>Week {index + 1} ({week.dates})</h3>
            <p>{week.content}</p>
          </WeekEntry>
        ))}
      </WeeksContainer>
    </ContentContainer>
  )
}
