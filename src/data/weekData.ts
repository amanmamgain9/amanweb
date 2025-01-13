export interface WeekEntry {
  dates: string;
  startDate: Date;
  endDate: Date;
  highlights: string[];
  details: {
    hoursWorked: number;
    gymDays: number;
    averageSteps: string;
  };
}

export interface MonthData {
  [key: string]: {
    weeks: WeekEntry[];
  };
}

// Add a type for valid month keys
export type ValidMonth = keyof typeof weekData;

export const weekData: MonthData = {
  'January 2025': {
    weeks: [
      {
        dates: 'Jan 6 - Jan 12',
        startDate: new Date(2025, 0, 6),
        endDate: new Date(2025, 0, 12),
        highlights: [
          'Made this pretty website',
          'Setup CUDA and CUDNN installation with multiple version support',
          'Trained faceswap model (results were suboptimal)'
        ],
        details: {
          hoursWorked: 52,
          gymDays: 4,
          averageSteps: "~ 5000"
        }
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

export const getOriginalMonthFormat = (monthId: string) => {
  // Convert "jan-2025" to "January 2025"
  const [month, year] = monthId.split('-');
  const months = {
    'jan': 'January',
    'feb': 'February',
    'mar': 'March',
    'apr': 'April',
    'may': 'May',
    'jun': 'June',
    'jul': 'July',
    'aug': 'August',
    'sep': 'September',
    'oct': 'October',
    'nov': 'November',
    'dec': 'December'
  };
  return `${months[month as keyof typeof months]} ${year}`;
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