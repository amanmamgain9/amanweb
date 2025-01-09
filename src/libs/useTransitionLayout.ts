/**
 * Layout Transition Library
 * Handles smooth transitions between different route/state layouts
 */

import React, { useEffect, useRef, useState } from 'react';

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
    list.style.overflow = 'hidden';
    content.style.flex = '1';

    return () => {
      // Cleanup styles on unmount
      container.style.display = '';
      list.style.overflow = '';
      content.style.flex = '';
    };
  }, [options]);

  // Handle route changes
  const navigateTo = (route: string) => {
    if (!options.layouts[route]) {
      console.warn(`Layout not found for route: ${route}`);
      return;
    }

    setPreviousLayout(getCurrentLayout());
    setCurrentRoute(route);
    setIsTransitioning(true);

    const list = options.listRef.current;
    const content = options.contentRef.current;
    if (!list || !content) return;

    const duration = options.duration || 300;
    const easing = options.easing || 'ease-in-out';

    // Setup transition
    list.style.transition = `width ${duration}ms ${easing}`;
    content.style.transition = `opacity ${duration}ms ${easing}`;

    // Start transition
    requestAnimationFrame(() => {
      // First fade out
      content.style.opacity = '0';
      
      // Then adjust width if needed
      setTimeout(() => {
        if (list) {
          list.style.width = options.layouts[route].list ? '38.2%' : '0';
        }
      }, duration * 0.1);

      // Finally fade in new content
      setTimeout(() => {
        content.style.opacity = '1';
        
        // Complete transition
        setTimeout(() => {
          setIsTransitioning(false);
          setPreviousLayout(null);
        }, duration * 0.3);
      }, duration * 0.5);
    });
  };

  // Render function
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
    currentRoute
  };
};

// Usage Example:
/*
const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { Layout, navigateTo } = useLayoutTransition({
    duration: 300,
    containerRef,
    listRef,
    contentRef,
    initialRoute: 'about',
    layouts: {
      about: {
        content: <AboutPage />
      },
      posts: {
        list: <PostsList />,
        content: <PostContent />
      },
      projects: {
        list: <ProjectList />,
        content: <ProjectContent />
      }
    }
  });

  return (
    <div ref={containerRef}>
      <div ref={listRef}>
        <Layout />
      </div>
      <div ref={contentRef}>
        <Layout />
      </div>
      <button onClick={() => navigateTo('posts')}>Go to Posts</button>
    </div>
  );
};
*/

export default useLayoutTransition;
