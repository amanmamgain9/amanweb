import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { WeekEntry as WeekDataType, weekData, isDateInWeeks, getCurrentMonthDefault, getOriginalMonthFormat, formatMonthId } from '../data/weekData';
import { baseTheme, CalendarWrapper } from '../libs/calendarStyles';
import { WDYGDTWList } from './WDYGDTWList';
import { WeekDetail } from './WeekDetailComponent';
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
  
  @media (max-width: 768px) {
    display: none;
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

const HighlightsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`

const HighlightItem = styled.li`
  padding: 0.5rem 0;
  
  &:last-child {
    border-bottom: none;
  }

  a {
    color: #00f0ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

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
  font-family: 'Miso';
  font-size: 1.2em;

  &:hover {
    background: rgba(0, 240, 255, 0.2);
    transform: translateY(-1px);
  }
`

const MainContentWrapper = styled.div<{ $isDetailView: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  display: ${props => props.$isDetailView ? 'none' : 'block'};
`

interface WeekItemProps {
  week: WeekDataType;
  isExpanded: boolean;
  onToggle: () => void;
  onViewDetail: () => void;
}

const WeekItem = ({ week, isExpanded, onToggle, onViewDetail }: WeekItemProps) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle();
  }

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetail();
  }

  return (
    <WeekItemContainer>
      <WeekHeader 
      $isExpanded={isExpanded}
        onClick={handleToggle}
        style={{ cursor: 'pointer' }}
      >
        <span>Week {week.weekIndex} ({week.dates})</span>
      </WeekHeader>
      <WeekContent $isExpanded={isExpanded}>
        <HighlightsList>
          {week.highlights.map((highlight, idx) => (
            <HighlightItem 
              key={idx}
              dangerouslySetInnerHTML={{ __html: highlight }}
            />
          ))}
        </HighlightsList>
        <ViewDetailButton onClick={handleViewDetail}>
          View Full Details →
        </ViewDetailButton>
      </WeekContent>
    </WeekItemContainer>
  )
}

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
  const [expandedWeekIndex, setExpandedWeekIndex] = useState<number>(0)
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

  const monthYear = getOriginalMonthFormat(weekId);
  let currentMonthData = weekData[monthYear]?.weeks || [];
  currentMonthData = [...currentMonthData].reverse();

  const handleDateChange = (
    value: Date | [Date, Date] | null | any
  ) => {
    if (value instanceof Date && isDateInWeeks(value, weekData)) {
      setDate(value)
      setExpandedWeekIndex(0)
      // Update weekId based on selected date
      const monthYear = value.toLocaleString('default', { 
        month: 'long',
        year: 'numeric'
      });
      const formattedMonthId = formatMonthId(monthYear);
      setWeekId(formattedMonthId);
    }
  }

  const handleWeekToggle = (index: number) => {
    setExpandedWeekIndex(expandedWeekIndex === index ? -1 : index)
  }

  const handleShowDetail = (weekIndex: number) => {
    onFocusSelect(`${weekId}/${weekIndex}`);
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
            [...currentMonthData].map((week, index) => (
              <WeekItem
                key={index}
                week={week}
                isExpanded={expandedWeekIndex === index}
                onToggle={() => handleWeekToggle(index)}
                onViewDetail={() => handleShowDetail(week.weekIndex)}
              />
            ))
          )}
        </WeeksContainer>
      </MainContentWrapper>
      
      {selectedWeek && showingDetail && (
        <WeekDetail 
          week={selectedWeek.week}
          onClose={() => onUnsetFocus()}
        />
      )}
    </ContentContainer>
  )
}
