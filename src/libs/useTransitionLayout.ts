import React, { useEffect, useState } from 'react';

const runAfter = (ms: number, fn: () => void) => setTimeout(fn, ms);

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
    const [futureRoute, setFutureRoute] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const duration = options.duration || 300;
    const easing = options.easing || 'ease-in-out';

    const [showFutureContent, setShowFutureContent] = useState(false);

    // Get both current and future layouts when needed
    const getLayouts = () => {
        if (futureRoute && showFutureContent) {
            return {
                oldLayout: options.layouts[currentRoute],
                newLayout: options.layouts[futureRoute]
            };
        }
        return {
            currentLayout: options.layouts[currentRoute]
        };
    };

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
        content.style.position = 'relative'; // Added for absolute positioning of children

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
            content.style.position = '';
        };
    }, [options.containerRef, options.listRef, options.contentRef, duration, easing, currentRoute]);

    const navigateTo = (route: string) => {
        if (route === currentRoute || !options.layouts[route]) return;
        if (isTransitioning) return;

        setFutureRoute(route);
        setIsTransitioning(true);

        const list = options.listRef.current;
        const content = options.contentRef.current;
        if (!list || !content) return;

        // Phase 1: Start fade out of old content
        runAfter(duration * 0.2, () => {
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
        });

        // Phase 2: Add new content alongside old
        runAfter(duration * 0.5, () => {
            setShowFutureContent(true);
        });

        // Phase 3: Complete transition
        runAfter(duration, () => {
            setCurrentRoute(route);
            setIsTransitioning(false);
            setFutureRoute(null);
            setShowFutureContent(false);
        });
    };

    const Layout = ({ type }: { type: 'list' | 'content' }) => {
        const layouts = getLayouts();
        
        if ('currentLayout' in layouts) {
            const layout = layouts.currentLayout;
            return type === 'list' ? layout.list : layout.content;
        }
        
        // During transition, render both old and new content
        if (type === 'list') {
            return layouts.oldLayout.list || layouts.newLayout.list;
        }

        // Render content with transition styles
        return (
            <>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    opacity: isTransitioning ? 0 : 1,
                    transition: `opacity ${duration}ms ${easing}`
                }}>
                    {layouts.oldLayout.content}
                </div>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    opacity: isTransitioning ? 1 : 0,
                    transition: `opacity ${duration}ms ${easing}`
                }}>
                    {layouts.newLayout.content}
                </div>
            </>
        );
    };

    return {
        Layout,
        navigateTo,
        currentRoute
    };
};

export default useLayoutTransition;