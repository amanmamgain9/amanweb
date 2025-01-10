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
        list.style.transition = `width ${duration * 0.4}ms ${easing}`;
        content.style.transition = `width ${duration * 0.4}ms ${easing}`;
        content.style.position = 'relative';
        content.style.overflow = 'hidden';

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
            content.style.overflow = '';
        };
    }, [options.containerRef, options.listRef, options.contentRef, duration, easing, currentRoute]);

    const navigateTo = (route: string) => {
        if (route === currentRoute || !options.layouts[route]) return;
        if (isTransitioning) return;

        setIsTransitioning(true);
        setFutureRoute(route);

        const list = options.listRef.current;
        const content = options.contentRef.current;
        if (!list || !content) return;

        // Phase 1: Adjust widths
        const hasListView = !!options.layouts[route].list;
        if (hasListView) {
            list.style.width = '38.2%';
            content.style.width = '61.8%';
        } else {
            list.style.width = '0';
            content.style.width = '100%';
        }

        // Complete transition after width change
        runAfter(duration * 0.4, () => {
            setCurrentRoute(route);
            setFutureRoute(null);
            setIsTransitioning(false);
        });
    };

    const Layout = ({ type }: { type: 'list' | 'content' }) => {
        if (type === 'list') {
            return futureRoute ? options.layouts[futureRoute].list : options.layouts[currentRoute].list;
        }

        // For content transitions
        return (
            <>
                {!isTransitioning && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: 'translateY(0)',
                        transition: `transform ${duration * 0.6}ms ${easing}`
                    }}>
                        {options.layouts[currentRoute].content}
                    </div>
                )}
                {isTransitioning && futureRoute && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: 'translateY(-100%)',
                        animation: `slideDown ${duration * 0.6}ms ${easing} forwards`,
                        animationDelay: `${duration * 0.4}ms`
                    }}>
                        {options.layouts[futureRoute].content}
                    </div>
                )}
                <style>
                    {`
                    @keyframes slideDown {
                        from { transform: translateY(-100%); }
                        to { transform: translateY(0); }
                    }
                    `}
                </style>
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