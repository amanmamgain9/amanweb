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

export const getCurrentMonthDefault = () => {
  const date = new Date();
  return date.toLocaleString('default', { 
    month: 'short', // 'Jan'
    year: 'numeric'  // '2025'
  }).replace(' ', '-').toLowerCase(); // Returns "jan-2025"
}

// Add a helper to convert month format
export const formatMonthId = (monthYear: string) => {
  // Convert "January 2025" to "jan-2025"
  const [month, year] = monthYear.split(' ');
  return `${month.slice(0,3).toLowerCase()}-${year}`;
}

// Add helper to get original format if needed
export const getOriginalMonthFormat = (monthId: string) => {
  // Convert "jan-2025" to "January 2025"
  const [month, year] = monthId.split('-');
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

export const isDateInWeeks = (date: Date, monthData: MonthData): boolean => {
  const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
  const month = monthData[monthKey];
  
  if (!month || month.weeks.length === 0) return false;
  
  // If the month has any entries, make the whole month selectable
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  return date >= firstDayOfMonth && date <= lastDayOfMonth;
};
