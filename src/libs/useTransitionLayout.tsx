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
    contentDuration?: number;
    easing?: string;
    containerRef: React.RefObject<HTMLElement>;
    listRef: React.RefObject<HTMLElement>;
    contentRef: React.RefObject<HTMLElement>;
    layouts: RouteLayouts;
    initialRoute: string;
}

const useLayoutTransition = (options: TransitionOptions) => {
    const [currentRoute, setCurrentRoute] = useState<string>(options.initialRoute);
    const [isRouteTransition, setIsRouteTransition] = useState(false);
    const [hasListContent, setHasListContent] = useState(!!options.layouts[options.initialRoute].list);
    const duration = options.duration || 300;
    const contentDuration = options.contentDuration || 500;
    const easing = options.easing || 'ease-in-out';

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes animateTop {
                from {
                    position: relative;
                    top: -300px;
                    opacity: 0;
                }
                to {
                    position: relative;
                    top: 0;
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        return () => style.remove();
    }, []);

    useEffect(() => {
        const container = options.containerRef.current;
        const list = options.listRef.current;
        const content = options.contentRef.current;

        if (!container || !list || !content) {
            console.warn('Layout transition: Required elements not found');
            return;
        }

        container.style.display = 'flex';
        list.style.transition = `width ${duration}ms ${easing}`;
        content.style.transition = `width ${duration}ms ${easing}`;

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
        
        const list = options.listRef.current;
        const content = options.contentRef.current;
        if (!list || !content) return;

        const hasListView = !!options.layouts[route].list;
        if (hasListView) {
            list.style.width = '38.2%';
            content.style.width = '61.8%';
        } else {
            list.style.width = '0';
            content.style.width = '100%';
        }

        // Wait for width transition to complete before starting content animation
        runAfter(duration, () => {
            setIsRouteTransition(true);
            setCurrentRoute(route);
            runAfter(contentDuration, () => {
                setIsRouteTransition(false);
                setHasListContent(hasListView);
            });
        });
    };

    const Layout = ({ type }: { type: 'list' | 'content' }) => {
        const layout = options.layouts[currentRoute];
        
        if (type === 'list' && !layout.list) return null;
        
        const content = type === 'list' ? layout.list : layout.content;

        return (
            <div 
                style={{
                    display: 'grid',
                    width: '100%',
                    position: 'relative'
                }}
            >
                <div
                    key={currentRoute}
                    style={{ 
                        gridArea: '1 / 1',
                        width: '100%',
                        position: 'relative',
                        animation: isRouteTransition ? `animateTop ${contentDuration}ms ${easing}` : 'none'
                    }}
                >
                    {content}
                </div>
            </div>
        );
    };

    return {
        Layout,
        navigateTo,
        currentRoute,
        hasListContent
    };
};

export default useLayoutTransition;
