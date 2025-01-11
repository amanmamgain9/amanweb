export interface WeekEntry {
  dates: string;
  content: string;
  startDate: Date;
  endDate: Date;
}

export interface MonthData {
  [key: string]: {
    weeks: WeekEntry[];
  };
}

export const weekData: MonthData = {
  'January 2025': {
    weeks: [
      {
        dates: 'Dec 30 - Jan 5',
        content: 'Started the year with new project planning and goal setting. Implemented the initial structure for the portfolio website redesign.',
        startDate: new Date(2024, 11, 30),
        endDate: new Date(2025, 0, 5)
      },
      {
        dates: 'Jan 6 - Jan 12',
        content: 'Completed the main navigation components. Added smooth transitions between different sections. Improved mobile responsiveness.',
        startDate: new Date(2025, 0, 6),
        endDate: new Date(2025, 0, 12)
      },
      {
        dates: 'Jan 13 - Jan 19',
        content: 'Implemented the showcase feature with detailed project views. Added animation effects for better user experience.',
        startDate: new Date(2025, 0, 13),
        endDate: new Date(2025, 0, 19)
      },
      {
        dates: 'Jan 20 - Jan 26',
        content: 'Created the weekly progress tracking system. Enhanced overall UI/UX with consistent styling and interactions.',
        startDate: new Date(2025, 0, 20),
        endDate: new Date(2025, 0, 26)
      },
      {
        dates: 'Jan 27 - Feb 2',
        content: 'Final touches on the portfolio website. Deployed to production and performed thorough testing.',
        startDate: new Date(2025, 0, 27),
        endDate: new Date(2025, 1, 2)
      }
    ]
  }
};

export const isDateInWeeks = (date: Date, monthData: MonthData): boolean => {
  const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
  const month = monthData[monthKey];
  
  if (!month) return false;
  
  return month.weeks.some(week => {
    const startDate = week.startDate;
    const endDate = week.endDate;
    return date >= startDate && date <= endDate;
  });
};
