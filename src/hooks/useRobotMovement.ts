import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

export type AndroidPosition = {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  rx?: number;
  ry?: number;
  mode?: 'dock' | 'roam' | 'peek';
} | null;

type FootprintUpdate = Exclude<AndroidPosition, null>;

type ViewportBands = {
  isCompact: boolean;
};

type UseRobotMovementArgs = {
  mainFlowRef: MutableRefObject<HTMLElement | null>;
  heroVisualRef?: MutableRefObject<HTMLElement | null>;
  footerRef?: MutableRefObject<HTMLElement | null>;
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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type UndockState = { x0: number; scroll0: number } | null;
type SmoothState = { x: number; y: number; lastMs: number } | null;

type ComputeRefs = {
  undockRef: MutableRefObject<UndockState>;
  peekSmoothRef: MutableRefObject<SmoothState>;
};

const computeScrollingAndroid = (
  flow: HTMLElement | null,
  hero: HTMLElement | null,
  viewport: ViewportBands,
  freezeMovement: boolean,
  isPeekActive: boolean,
  refs: ComputeRefs,
  nowMs: number,
): { position: AndroidPosition; isDocked: boolean } => {
  if (!flow) return { position: null, isDocked: true };

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
      position: {
        x: clamp(dockX, pad, vw - pad),
        y: clamp(dockY, radius + 8, vh - radius - 8),
        radius,
        intensity: 0.6,
        mode: 'dock',
      },
      isDocked: true,
    };
  }

  const undocked = dockY <= roamY;

  if (!undocked) {
    refs.undockRef.current = null;
    refs.peekSmoothRef.current = null;
    return {
      position: {
        x: clamp(dockX, pad, vw - pad),
        y: clamp(dockY, radius + 8, vh - radius - 8),
        radius,
        intensity: 0.55,
        mode: 'dock',
      },
      isDocked: true,
    };
  }

  if (refs.undockRef.current === null) {
    refs.undockRef.current = { x0: dockX, scroll0: window.scrollY };
  }

  const centerX = flowRect.left + flowRect.width * 0.5;
  const amplitude = flowRect.width * (viewport.isCompact ? 0.34 : 0.42);
  const omega = viewport.isCompact ? Math.PI * 2.0 : Math.PI * 2.2;
  const ratio = clamp((refs.undockRef.current.x0 - centerX) / Math.max(amplitude, 1e-4), -1, 1);
  const phase = Math.acos(ratio);
  const tDenom = Math.max(flowRect.height - vh, 1);
  const t = clamp01((window.scrollY - refs.undockRef.current.scroll0) / tDenom);

  const roamX = centerX + amplitude * Math.cos(omega * t + phase);
  const roamPosY = roamY;

  if (isPeekActive) {
    const targetX = vw - radius * 0.5;
    const targetY = roamY;
    const prev = refs.peekSmoothRef.current ?? { x: roamX, y: roamPosY, lastMs: nowMs };
    // Time-based exponential smoothing: rate 6 → half-gap closed in ~115ms
    const dt = Math.min(0.1, Math.max(0, (nowMs - prev.lastMs) / 1000));
    const k = 1 - Math.exp(-6 * dt);
    const smoothed = {
      x: lerp(prev.x, targetX, k),
      y: lerp(prev.y, targetY, k),
      lastMs: nowMs,
    };
    refs.peekSmoothRef.current = smoothed;
    return {
      position: {
        x: clamp(smoothed.x, pad - radius, vw + radius),
        y: clamp(smoothed.y, radius + 8, vh - radius - 8),
        radius,
        intensity: 0.7,
        mode: 'peek',
      },
      isDocked: false,
    };
  }

  refs.peekSmoothRef.current = null;

  return {
    position: {
      x: clamp(roamX, pad, vw - pad),
      y: clamp(roamPosY, radius + 8, vh - radius - 8),
      radius,
      intensity: 0.56 + Math.sin(t * Math.PI) * 0.28,
      mode: 'roam',
    },
    isDocked: false,
  };
};

export const useRobotMovement = ({
  mainFlowRef,
  heroVisualRef,
  footerRef,
  freezeMovement = false,
}: UseRobotMovementArgs) => {
  const [viewport, setViewport] = useState<ViewportBands>(() => readViewportBands());
  const [scrollingAndroid, setScrollingAndroid] = useState<AndroidPosition>(null);
  const [androidFootprint, setAndroidFootprint] = useState<AndroidPosition>(null);
  const [isDocked, setIsDocked] = useState(true);
  const [undockSignal, setUndockSignal] = useState(0);
  const [isPeek, setIsPeek] = useState(false);

  const undockRef = useRef<UndockState>(null);
  const peekSmoothRef = useRef<SmoothState>(null);
  const lastDockedRef = useRef(true);
  const isPeekRef = useRef(false);

  useEffect(() => {
    const target = footerRef?.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsPeek(entry.isIntersecting && entry.intersectionRatio > 0.15);
      },
      { threshold: [0, 0.15, 0.4, 1] },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [footerRef]);

  useEffect(() => {
    let frame = 0;
    let loopFrame = 0;

    const update = () => {
      const nextViewport = readViewportBands();
      setViewport((current) => {
        if (current.isCompact === nextViewport.isCompact) return current;
        return nextViewport;
      });

      const { position, isDocked: dockedNow } = computeScrollingAndroid(
        mainFlowRef.current,
        heroVisualRef?.current ?? null,
        nextViewport,
        freezeMovement,
        isPeekRef.current,
        { undockRef, peekSmoothRef },
        performance.now(),
      );

      setScrollingAndroid(position);

      if (lastDockedRef.current && !dockedNow) {
        setUndockSignal((n) => n + 1);
      }
      lastDockedRef.current = dockedNow;
      setIsDocked((current) => (current === dockedNow ? current : dockedNow));

      if (!position) {
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

    const loop = () => {
      update();
      if (isPeekRef.current) {
        loopFrame = window.requestAnimationFrame(loop);
      } else {
        loopFrame = 0;
      }
    };

    const startLoop = () => {
      if (loopFrame) return;
      loopFrame = window.requestAnimationFrame(loop);
    };

    const onPeekChange = () => {
      if (isPeekRef.current) startLoop();
    };
    window.addEventListener('robot:peek-change', onPeekChange);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      window.removeEventListener('robot:peek-change', onPeekChange);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
      if (loopFrame) window.cancelAnimationFrame(loopFrame);
    };
  }, [freezeMovement, heroVisualRef, mainFlowRef]);

  useEffect(() => {
    isPeekRef.current = isPeek;
    window.dispatchEvent(new Event('robot:peek-change'));
  }, [isPeek]);

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
    isDocked,
    undockSignal,
    isPeek,
  };
};
