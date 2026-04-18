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

const computeScrollingAndroid = (
  flow: HTMLElement | null,
  heroVisual: HTMLElement | null,
  footer: HTMLElement | null,
  viewport: ViewportBands,
  freezeMovement: boolean,
): AndroidPosition => {
  if (!flow) return null;

  const flowRect = flow.getBoundingClientRect();
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const radius = viewport.isCompact ? 22 : 26;
  const pad = radius + 12;

  const heroRect = heroVisual?.getBoundingClientRect() ?? null;
  const dockX = heroRect ? heroRect.left + heroRect.width * 0.5 : vw * 0.72;
  const dockY = heroRect ? heroRect.top + heroRect.height * 0.42 : 120;

  if (freezeMovement) {
    return {
      x: clamp(dockX, pad, vw - pad),
      y: clamp(dockY, radius + 8, vh - radius - 8),
      radius,
      intensity: 0.6,
    };
  }

  // 1) Launch from dock based on initial scroll distance.
  const launchStart = viewport.isCompact ? 22 : 30;
  const launchDistance = viewport.isCompact ? 170 : 230;
  const launch = clamp01((window.scrollY - launchStart) / launchDistance);
  const launchEase = launch * launch * (3 - 2 * launch);

  // 2) Roaming path based on whole-page scroll progress.
  const route = clamp01((70 - flowRect.top) / Math.max(flowRect.height - vh, 1));
  const centerX = flowRect.left + flowRect.width * 0.5;
  const amplitude = flowRect.width * (viewport.isCompact ? 0.34 : 0.38);
  const roamX = centerX + amplitude * Math.cos(route * Math.PI * 4);
  const roamTop = 86 + radius;
  const roamBottom = vh - radius * 2 - 18;
  const roamLift = viewport.isCompact ? 16 : 22;
  const roamY = roamTop + (roamBottom - roamTop) * route - roamLift;

  let x = dockX + (roamX - dockX) * launchEase;
  let y = dockY + (roamY - dockY) * launchEase;

  // 3) Near footer, park left and above contact links.
  const footerRect = footer?.getBoundingClientRect() ?? null;
  if (footerRect && footerRect.top < vh - 12 && footerRect.bottom > 0) {
    const park = clamp01((vh - footerRect.top) / Math.max(footerRect.height + 60, 1));
    const parkX = pad + radius * 0.5;
    const parkY = Math.min(vh - radius - 14, footerRect.top - radius - 16);
    x += (parkX - x) * park;
    y += (parkY - y) * park;
  }

  x = clamp(x, pad, vw - pad);
  y = clamp(y, radius + 8, vh - radius - 8);

  return {
    x,
    y,
    radius,
    intensity: 0.56 + Math.sin(route * Math.PI) * 0.32,
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
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const nextViewport = readViewportBands();
      setViewport((current) => {
        if (current.isCompact === nextViewport.isCompact) {
          return current;
        }
        return nextViewport;
      });

      const nextAndroid = computeScrollingAndroid(
        mainFlowRef.current,
        heroVisualRef?.current ?? null,
        footerRef?.current ?? null,
        nextViewport,
        freezeMovement,
      );
      setScrollingAndroid(nextAndroid);

      const footer = footerRef?.current;
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const nextVisible = rect.top < window.innerHeight - 12 && rect.bottom > 0;
        setIsFooterVisible((current) => (current === nextVisible ? current : nextVisible));
      } else {
        setIsFooterVisible((current) => (current ? false : current));
      }

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
  }, [footerRef, freezeMovement, heroVisualRef, mainFlowRef]);

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
    isFooterVisible,
    handleFootprintChange,
  };
};
