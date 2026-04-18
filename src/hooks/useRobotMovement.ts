import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

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
  };
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

type UndockState = { x0: number; scroll0: number } | null;

const computeScrollingAndroid = (
  flow: HTMLElement | null,
  hero: HTMLElement | null,
  viewport: ViewportBands,
  freezeMovement: boolean,
  undockRef: MutableRefObject<UndockState>,
): AndroidPosition => {
  if (!flow) return null;

  const flowRect = flow.getBoundingClientRect();
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const radius = viewport.isCompact ? 22 : 26;
  const pad = radius + 12;
  const roamY = viewport.isCompact ? 108 : 128;

  const heroRect = hero?.getBoundingClientRect() ?? null;
  const dockX = heroRect ? heroRect.left + heroRect.width * 0.5 : vw * 0.72;
  const dockY = heroRect ? heroRect.top + heroRect.height * 0.5 : 140;

  if (freezeMovement) {
    return {
      x: clamp(dockX, pad, vw - pad),
      y: clamp(dockY, radius + 8, vh - radius - 8),
      radius,
      intensity: 0.6,
    };
  }

  // Undock the moment the live dock center crosses the roam line.
  // Before: robot rides the dock element (natural during early scroll).
  // After: y is locked to roamY; x sweeps a cosine from the undock-capture x.
  const undocked = dockY <= roamY;

  if (!undocked) {
    undockRef.current = null;
    return {
      x: clamp(dockX, pad, vw - pad),
      y: clamp(dockY, radius + 8, vh - radius - 8),
      radius,
      intensity: 0.55,
    };
  }

  if (undockRef.current === null) {
    undockRef.current = { x0: dockX, scroll0: window.scrollY };
  }

  const centerX = flowRect.left + flowRect.width * 0.5;
  const amplitude = flowRect.width * (viewport.isCompact ? 0.34 : 0.42);
  const omega = viewport.isCompact ? Math.PI * 2.0 : Math.PI * 2.2;
  const ratio = clamp((undockRef.current.x0 - centerX) / Math.max(amplitude, 1e-4), -1, 1);
  const phase = Math.acos(ratio);
  const tDenom = Math.max(flowRect.height - vh, 1);
  const t = clamp01((window.scrollY - undockRef.current.scroll0) / tDenom);

  const x = centerX + amplitude * Math.cos(omega * t + phase);
  const y = roamY;

  return {
    x: clamp(x, pad, vw - pad),
    y: clamp(y, radius + 8, vh - radius - 8),
    radius,
    intensity: 0.56 + Math.sin(t * Math.PI) * 0.28,
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
  const undockRef = useRef<UndockState>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const nextViewport = readViewportBands();
      setViewport((current) => {
        if (current.isCompact === nextViewport.isCompact) return current;
        return nextViewport;
      });

      const nextAndroid = computeScrollingAndroid(
        mainFlowRef.current,
        heroVisualRef?.current ?? null,
        nextViewport,
        freezeMovement,
        undockRef,
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
