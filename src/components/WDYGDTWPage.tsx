import { useState } from 'react'
import styled from 'styled-components'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

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
    max-width: 400px;
    margin: 0 auto;
    background: rgba(13, 35, 57, 0.95);
    border: 1px solid #1c4c7c;
    border-radius: 8px;
    
    button {
      color: #00f0ff;
      
      &:hover {
        background-color: rgba(0, 240, 255, 0.1);
      }
    }
    
    .react-calendar__tile--active {
      background: rgba(0, 240, 255, 0.2);
    }
    
    .react-calendar__month-view__days__day--weekend {
      color: #ff6b6b;
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

interface MonthData {
  [key: string]: {
    weeks: {
      dates: string;
      content: string;
    }[];
  };
}

const monthlyData: MonthData = {
  'January 2025': {
    weeks: [
      { dates: 'Dec 30 - Jan 5', content: 'Week 1 achievements and progress...' },
      { dates: 'Jan 6 - Jan 12', content: 'Week 2 progress and milestones...' },
      { dates: 'Jan 13 - Jan 19', content: 'Week 3 accomplishments...' },
      { dates: 'Jan 20 - Jan 26', content: 'Week 4 developments...' },
      { dates: 'Jan 27 - Feb 2', content: 'Week 5 wrap-up...' }
    ]
  }
  // Add more months as needed
}

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
            setDate(newDate)
            setCurrentMonth(newDate.toLocaleString('default', { month: 'long', year: 'numeric' }))
          }}
          value={date}
          maxDetail="year"
          minDetail="month"
          showNavigation={true}
          view="year"
        />
      </CalendarWrapper>

      <WeeksContainer>
        {monthlyData[currentMonth]?.weeks.map((week, index) => (
          <WeekEntry key={index}>
            <h3>Week {index + 1} ({week.dates})</h3>
            <p>{week.content}</p>
          </WeekEntry>
        ))}
      </WeeksContainer>
    </ContentContainer>
  )
}
