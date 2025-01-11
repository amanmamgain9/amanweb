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
        dates: 'Jan 1 - Jan 5',
        content: 'Started the year with initial project planning and setup.',
        startDate: new Date(2025, 0, 1),
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
        content: 'Implemented core features and fixed critical bugs.',
        startDate: new Date(2025, 0, 13),
        endDate: new Date(2025, 0, 19)
      },
      {
        dates: 'Jan 20 - Jan 26',
        content: 'Enhanced user interface and added new animations.',
        startDate: new Date(2025, 0, 20),
        endDate: new Date(2025, 0, 26)
      },
      {
        dates: 'Jan 27 - Jan 31',
        content: 'Wrapped up January tasks and prepared for February goals.',
        startDate: new Date(2025, 0, 27),
        endDate: new Date(2025, 0, 31)
      }
    ]
  }
};

export const isDateInWeeks = (date: Date, monthData: MonthData): boolean => {
  const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
  const month = monthData[monthKey];
  
  if (!month || month.weeks.length === 0) return false;
  
  // If the month has any entries, make the whole month selectable
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  return date >= firstDayOfMonth && date <= lastDayOfMonth;
};
