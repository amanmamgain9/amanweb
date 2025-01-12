import { createContext, useContext, useState, ReactNode } from 'react';
import { showcaseItems } from '../data/showcaseItems';
import { ShowcaseItem } from '../types/showcase';

interface ShowcaseContextType {
  items: ShowcaseItem[];
  selectedItem: ShowcaseItem | null;
  setSelectedItem: (slug: string | null) => void;
}

const ShowcaseContext = createContext<ShowcaseContextType | undefined>(undefined);

export function ShowcaseProvider({ children }: { children: ReactNode }) {
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);

  const handleSetSelectedItem = (slug: string | null) => {
    const item = slug ? showcaseItems.find(item => item.slug === slug) : null;
    setSelectedItem(item);
  };

  return (
    <ShowcaseContext.Provider value={{
      items: showcaseItems,
      selectedItem,
      setSelectedItem: handleSetSelectedItem,
    }}>
      {children}
    </ShowcaseContext.Provider>
  );
}

export function useShowcase() {
  const context = useContext(ShowcaseContext);
  if (context === undefined) {
    throw new Error('useShowcase must be used within a ShowcaseProvider');
  }
  return context;
}
