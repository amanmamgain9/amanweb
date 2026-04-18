import { useCallback, useEffect, useState, type MutableRefObject } from 'react';

export type AndroidPosition = {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  rx?: number;
  ry?: number;
} | null;

type FootprintUpdate = Exclude<AndroidPosition, null>;

type ViewportBands = {
  isCompact: boolean;
  isMedium: boolean;
};

type UseRobotMovementArgs = {
  mainFlowRef: MutableRefObject<HTMLElement | null>;
  heroVisualRef?: MutableRefObject<HTMLElement | null>;
  freezeMovement?: boolean;
};

const readViewportBands = (): ViewportBands => {
  const width = window.innerWidth;
  return {
    isCompact: width <= 900,
    isMedium: width > 900 && width <= 1100,
  };
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const computeScrollingAndroid = (
  flow: HTMLElement | null,
  heroVisual: HTMLElement | null,
  viewport: ViewportBands,
  freezeMovement: boolean,
): AndroidPosition => {
  if (!flow) return null;

  const flowRect = flow.getBoundingClientRect();
  const vh = window.innerHeight;
  const baseRadius = viewport.isCompact ? 20 : 24;

  const HEADER_HEIGHT = 60;
  const ZIG_ZAG_CYCLES = 2.5;
  const AMPLITUDE_FRAC = viewport.isCompact ? 0.42 : viewport.isMedium ? 0.32 : 0.44;
  const contentCenter = flowRect.left + flowRect.width * 0.5;
  const amplitude = flowRect.width * AMPLITUDE_FRAC;
  const heroRect = heroVisual?.getBoundingClientRect() ?? null;
  const dockX = heroRect ? heroRect.left + heroRect.width * 0.5 : contentCenter + amplitude;
  const dockY = heroRect ? heroRect.top + heroRect.height * 0.42 : HEADER_HEIGHT + 42;
  const topY = HEADER_HEIGHT + 10;
  const progressRaw = (topY - flowRect.top) / Math.max(flowRect.height - vh, 1);
  const progress = clamp01(progressRaw);
  const releaseStart = viewport.isCompact ? 18 : 28;
  const releaseDistance = viewport.isCompact ? 130 : 180;
  const releaseRaw = (window.scrollY - releaseStart) / releaseDistance;
  const release = clamp01(releaseRaw);
  const releaseEase = 1 - (1 - release) ** 3;
  const movingSizeBoost = viewport.isCompact ? 2 : 3;
  const radius = baseRadius + movingSizeBoost;
  const bottomY = vh - radius * 2;
  const VIEWPORT_PAD = radius + 12;

  const pathXRaw = contentCenter + amplitude * Math.cos(progress * ZIG_ZAG_CYCLES * 2 * Math.PI);
  const pathYRaw = topY + (bottomY - topY) * progress;
  const targetY = Math.max(dockY, pathYRaw);
  const pathX = dockX + (pathXRaw - dockX) * releaseEase;
  const pathY = dockY + (targetY - dockY) * releaseEase;
  const x = Math.max(VIEWPORT_PAD, Math.min(window.innerWidth - VIEWPORT_PAD, pathX));
  const y = Math.max(radius + 8, Math.min(vh - radius - 8, pathY));

  if (freezeMovement) {
    return {
      x: Math.max(VIEWPORT_PAD, Math.min(window.innerWidth - VIEWPORT_PAD, dockX)),
      y: Math.max(radius + 8, Math.min(vh - radius - 8, dockY)),
      radius,
      intensity: 0.6,
    };
  }

  return {
    x,
    y,
    radius,
    intensity: 0.56 + Math.sin(progress * Math.PI) * 0.36,
  };
};

export const useRobotMovement = ({
  mainFlowRef,
  heroVisualRef,
  freezeMovement = false,
}: UseRobotMovementArgs) => {
  const [viewport, setViewport] = useState<ViewportBands>(() => readViewportBands());
  const [scrollingAndroid, setScrollingAndroid] = useState<AndroidPosition>(null);
  const [androidFootprint, setAndroidFootprint] = useState<AndroidPosition>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const nextViewport = readViewportBands();
      setViewport((current) => {
        if (
          current.isCompact === nextViewport.isCompact &&
          current.isMedium === nextViewport.isMedium
        ) {
          return current;
        }
        return nextViewport;
      });

      const nextAndroid = computeScrollingAndroid(
        mainFlowRef.current,
        heroVisualRef?.current ?? null,
        nextViewport,
        freezeMovement,
      );
      setScrollingAndroid(nextAndroid);

      if (!nextAndroid) {
        setAndroidFootprint((current) => (current ? null : current));
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [freezeMovement, heroVisualRef, mainFlowRef]);

  const handleFootprintChange = useCallback((next: FootprintUpdate) => {
    setAndroidFootprint((current) => {
      if (!current) return next;
      const dx = Math.abs(current.x - next.x);
      const dy = Math.abs(current.y - next.y);
      const dr = Math.abs(current.radius - next.radius);
      const drx = Math.abs((current.rx ?? current.radius) - (next.rx ?? next.radius));
      const dry = Math.abs((current.ry ?? current.radius) - (next.ry ?? next.radius));
      if (dx < 0.75 && dy < 0.75 && dr < 0.6 && drx < 0.6 && dry < 0.6) return current;
      return next;
    });
  }, []);

  const reflowObstacle = freezeMovement ? null : (androidFootprint ?? scrollingAndroid);
  const speechTarget = reflowObstacle;

  return {
    isCompact: viewport.isCompact,
    scrollingAndroid,
    reflowObstacle,
    speechTarget,
    handleFootprintChange,
  };
};
