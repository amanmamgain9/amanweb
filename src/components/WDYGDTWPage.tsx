import { useState } from 'react'
import styled from 'styled-components'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const ListContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
`

const ContentContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
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

const WeeklyCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
`

const WeekCard = styled.div`
  border: 1px solid #1c4c7c;
  border-radius: 8px;
  padding: 1.5rem;
  background: rgba(13, 35, 57, 0.95);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: #00f0ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 240, 255, 0.1);
  }
`

const WeekHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1c4c7c;
  padding-bottom: 0.5rem;
`

const WeekTitle = styled.h3`
  color: #00f0ff;
  margin: 0;
`

const WeekDate = styled.span`
  color: #58a6ff;
  font-size: 0.9em;
`

const WeekImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
`

interface WeekData {
  id: number;
  date: string;
  image: string;
}

// Mock data - replace with real data later
const mockWeeks: WeekData[] = [
  { id: 1, date: 'Jan 1-7, 2024', image: '/wdygdtw.jpeg' },
  { id: 2, date: 'Jan 8-14, 2024', image: '/wdygdtw.jpeg' },
  { id: 3, date: 'Jan 15-21, 2024', image: '/wdygdtw.jpeg' },
  // Add more weeks as needed
]

export function WDYGDTWList({ onWeekSelect }: { onWeekSelect: (weekId: number) => void }) {
  return (
    <ListContainer>
      <WeeklyCardsContainer>
        {mockWeeks.map(week => (
          <WeekCard key={week.id} onClick={() => onWeekSelect(week.id)}>
            <WeekHeader>
              <WeekTitle>Week {week.id}</WeekTitle>
              <WeekDate>{week.date}</WeekDate>
            </WeekHeader>
            <WeekImage src={week.image} alt={`Week ${week.id}`} />
          </WeekCard>
        ))}
      </WeeklyCardsContainer>
    </ListContainer>
  )
}

export function WDYGDTWContent({ weekId }: { weekId: number }) {
  const [date, setDate] = useState(new Date())
  
  return (
    <ContentContainer>
      <Title>What Did You Get Done This Week?</Title>
      
      <CalendarWrapper>
        <Calendar 
          onChange={setDate} 
          value={date}
          maxDetail="month"
          minDetail="month"
        />
      </CalendarWrapper>
      
      {/* Add specific week content here based on weekId */}
    </ContentContainer>
  )
}
