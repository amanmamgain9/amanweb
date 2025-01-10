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
    }, [options.containerRef, options.listRef, options.contentRef, duration, easing, currentRoute]);

    const navigateTo = (route: string) => {
        if (route === currentRoute || !options.layouts[route]) return;

        setCurrentRoute(route);
        setIsTransitioning(true);

        const list = options.listRef.current;
        const content = options.contentRef.current;
        if (!list || !content) return;

        // Phase 1: Initial fade out
        content.style.opacity = '0.5';

        // Phase 2: Width adjustment
        runAfter(duration * 0.1, () => {
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

        // Phase 3: Complete transition
        runAfter(duration * 0.8, () => {
            content.style.opacity = '1';
            runAfter(duration * 0.2, () => {
                setIsTransitioning(false);
            });
        });
    };

    const Layout = ({ type }: { type: 'list' | 'content' }) => {
        const currentLayout = getCurrentLayout();
        if (!currentLayout) return null;
        return type === 'list' ? currentLayout.list : currentLayout.content;
    };

    return {
        Layout,
        navigateTo,
        currentRoute
    };
};

export default useLayoutTransition;
