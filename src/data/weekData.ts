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
        dates: 'Jan 6 - Jan 12',
        content: 'Completed the main navigation components. Added smooth transitions between different sections. Improved mobile responsiveness.',
        startDate: new Date(2025, 0, 6),
        endDate: new Date(2025, 0, 12)
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
