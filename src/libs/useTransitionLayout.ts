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

const useLayoutTransition = (options: TransitionOptions) => {
  const [currentRoute, setCurrentRoute] = useState<string>(options.initialRoute);
  const [previousLayout, setPreviousLayout] = useState<LayoutState | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const duration = options.duration || 300;
  const easing = options.easing || 'ease-in-out';

  const getCurrentLayout = () => options.layouts[currentRoute];

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
    list.style.transition = `width ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
    content.style.transition = `width ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
    
    // Set initial widths
    const hasListView = !!options.layouts[currentRoute].list;
    if (hasListView) {
      list.style.width = '38.2%';
      content.style.width = '61.8%';
    } else {
      list.style.width = '0';
      content.style.width = '100%';
    }

    return () => {
      container.style.display = '';
      list.style.transition = '';
      content.style.transition = '';
    };
  }, [options.containerRef, options.listRef, options.contentRef, duration, easing]);

  const navigateTo = (route: string) => {
    if (route === currentRoute || !options.layouts[route]) return;

    setPreviousLayout(getCurrentLayout());
    setCurrentRoute(route);
    setIsTransitioning(true);

    const list = options.listRef.current;
    const content = options.contentRef.current;
    if (!list || !content) return;

    // Start transition sequence
    requestAnimationFrame(() => {
      // Phase 1: Initial fade out
      content.style.opacity = '0.5';
      
      // Phase 2: Width adjustment
      setTimeout(() => {
        const hasListView = !!options.layouts[route].list;
        if (hasListView) {
          list.style.width = '38.2%';
          list.style.opacity = '1';
          content.style.width = '61.8%';
        } else {
          list.style.width = '0';
          list.style.opacity = '0';
          content.style.width = '100%';
        }
      }, duration * 0.1);

      // Phase 3: Complete transition
      setTimeout(() => {
        content.style.opacity = '1';
        
        setTimeout(() => {
          setIsTransitioning(false);
          setPreviousLayout(null);
        }, duration * 0.2);
      }, duration * 0.8);
    });
  };

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
    isTransitioning
  };
};

export default useLayoutTransition;
