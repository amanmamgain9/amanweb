/**
 * Layout Transition Library
 * Handles smooth transitions between different route/state layouts
 */

import { useEffect, useRef, useState } from 'react';

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
      list.style.width = options.layouts[route].list ? '200px' : '0px';
      content.style.opacity = '0';

      setTimeout(() => {
        content.style.opacity = '1';
      }, duration * 0.3);

      setTimeout(() => {
        setIsTransitioning(false);
        setPreviousLayout(null);
      }, duration);
    });
  };

  // Render function
  const Layout = () => {
    const currentLayout = getCurrentLayout();
    if (!currentLayout) return null;

    return (
      <>
        {isTransitioning && previousLayout?.list ? previousLayout.list : currentLayout.list}
        {isTransitioning && previousLayout?.content ? previousLayout.content : currentLayout.content}
      </>
    );
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