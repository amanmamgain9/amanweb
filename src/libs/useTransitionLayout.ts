import React, { useEffect, useState } from 'react';

type LayoutState = {
  list?: React.ReactNode;
  content: React.ReactNode;
};

type RouteLayouts = {
  [key: string]: LayoutState;
};

interface TransitionOptions {
  duration?: number;
  easing?: string;
  containerRef: React.RefObject<HTMLElement>;
  listRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLElement>;
  layouts: RouteLayouts;
  initialRoute: string;
}

export type TransitionPhase = 'initial' | 'expanding' | 'complete';

const useLayoutTransition = (options: TransitionOptions) => {
  const [currentRoute, setCurrentRoute] = useState<string>(options.initialRoute);
  const [previousLayout, setPreviousLayout] = useState<LayoutState | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phase, setPhase] = useState<TransitionPhase>('complete');

  const getCurrentLayout = () => options.layouts[currentRoute];

  // Initialize transition system
  useEffect(() => {
    const container = options.containerRef.current;
    const list = options.listRef.current;
    const content = options.contentRef.current;

    if (!container || !list || !content) {
      console.warn('Layout transition: Required elements not found');
      return;
    }

    // Setup initial styles
    container.style.display = 'flex';
    content.style.flex = '1';

    return () => {
      // Cleanup styles on unmount
      container.style.display = '';
      content.style.flex = '';
    };
  }, [options.containerRef, options.listRef, options.contentRef]);

  // Handle route changes
  const navigateTo = (route: string) => {
    if (route === currentRoute) return;
    if (!options.layouts[route]) {
      console.warn(`Layout not found for route: ${route}`);
      return;
    }

    setPreviousLayout(getCurrentLayout());
    setCurrentRoute(route);
    setIsTransitioning(true);
    setPhase('initial');

    const list = options.listRef.current;
    const content = options.contentRef.current;
    if (!list || !content) return;

    const duration = options.duration || 300;
    const easing = options.easing || 'ease-in-out';

    // Setup transition
    content.style.transition = `opacity ${duration}ms ${easing}`;

    // Start transition sequence
    requestAnimationFrame(() => {
      // Initial fade out
      content.style.opacity = '0.5';
      setPhase('expanding');
      
      // Complete transition
      setTimeout(() => {
        setPhase('complete');
        content.style.opacity = '1';
        
        setTimeout(() => {
          setIsTransitioning(false);
          setPreviousLayout(null);
        }, duration * 0.2);
      }, duration * 0.8);
    });
  };

  // Render function for layouts
  const Layout = ({ type }: { type: 'list' | 'content' }) => {
    const currentLayout = getCurrentLayout();
    if (!currentLayout) return null;

    if (isTransitioning && previousLayout) {
      return type === 'list' ? previousLayout.list : previousLayout.content;
    }
    
    return type === 'list' ? currentLayout.list : currentLayout.content;
  };

  return {
    Layout,
    navigateTo,
    currentRoute,
    phase,
    isTransitioning
  };
};

export default useLayoutTransition;
