# Personal Portfolio Website

A modern, interactive portfolio website built with React, TypeScript, and Vite. Features a showcase of projects, weekly activity tracking, and smooth animations powered by Framer Motion.

## 🚀 Features

- **Project Showcase**
  - Display of various projects with detailed descriptions and tech stacks
  - Category-based filtering (Desktop, Game, AI, Web, Extensions)
  - Interactive project cards with smooth hover effects
  - Detailed view with technology breakdown

- **Weekly Activity Tracker (WDYGDTW)**
  - Calendar-based navigation with visual date indicators
  - Weekly activity summaries including:
    - Work hours tracked
    - Gym attendance
    - Average daily steps
  - Expandable weekly highlights
  - Detailed view with retro-styled scoreboard

- **Smooth Animations**
  - Page transitions using Framer Motion
  - Split-view layout animations
  - Content fade effects
  - Mobile-optimized motion design

- **Responsive Design**
  - Adaptive layout for desktop and mobile
  - Touch-friendly interactions
  - Optimized navigation for smaller screens
  - Fluid typography scaling

## 🛠️ Tech Stack

### Core
- React 18.3
- TypeScript 5.6
- Vite 6.0

### Styling & Animation
- Styled Components 6.1
- Framer Motion
- Custom theme system
- Retro-inspired UI elements

### Navigation & Interaction
- React Router DOM 7.1
- React Calendar 5.1
- React Icons 5.4
- Custom gesture handling

## 🏃‍♂️ Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Showcase/       # Project showcase components
│   ├── WDYGDTW/       # Weekly tracker components
│   └── shared/        # Reusable UI components
├── context/           # React context providers
├── data/             # Static data and types
├── libs/             # Animation and utility functions
├── styles/           # Global styles and themes
└── utils/            # Helper functions
```

## 🧩 Key Components

### Showcase System
- `ShowcaseList`: Grid-based project display
- `ShowcaseDetail`: Detailed project view
- `ShowcaseContext`: Global state management
- Category-based filtering system

### WDYGDTW (Weekly Tracker)
- `WDYGDTWContent`: Main tracker interface
- `WeekDetail`: Detailed weekly view
- `Calendar`: Date navigation component
- Activity metrics visualization

### Layout & Navigation
- `AnimatedLayout`: Handles page transitions
- `Navbar`: Responsive navigation
- `ContentSlot`: Dynamic content container
- Split view management system

## 🎨 Styling

### Fonts
- Miso (Light, Regular, Bold) for headings
- Press Start 2P for retro elements
- System fonts for body text

### Theme
- Dark mode optimized
- Retro-cyberpunk inspired
- Custom scrollbar styling
- Responsive breakpoints

### Animation System
- Page transitions
- Content reveals
- Interactive feedback
- Mobile gesture support

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - TypeScript build + Vite bundle
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔧 Development

### Code Quality
- ESLint with TypeScript support
- Custom React hooks rules
- Import sorting
- Consistent code style

### Performance
- Code splitting
- Lazy loading
- Optimized animations
- Asset optimization

### Browser Support
- Modern browsers
- Mobile Safari/Chrome
- Touch device support
