import styled from 'styled-components';

export const baseTheme = {
    primary: '#00f0ff',
    background: 'rgba(13, 35, 57, 0.95)',
    border: '#1c4c7c',
    weekend: '#ff6b6b',
    hoverTransition: 'all 0.2s ease'
  }

export const CalendarWrapper = styled.div`
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