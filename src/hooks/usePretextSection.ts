import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { layoutTextBlocks, type TextEntry, type PretextLine, type Obstacle } from '../utils/pretextLayout';

export type AndroidGlobal = {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  rx?: number;
  ry?: number;
} | null;

export function usePretextSection(
  entries: TextEntry[],
  android: AndroidGlobal,
) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth;
    setWidth((prev) => (prev === w ? prev : w));
  });

  // Height without obstacle — prevents layout-shift feedback loops
  const height = useMemo(() => {
    if (width <= 0) return 0;
    return layoutTextBlocks(entries, width, null).height;
  }, [width, entries]);

  // Lines with obstacle for robot reflow
  const lines = useMemo((): PretextLine[] => {
    if (width <= 0) return [];

    let obstacle: Obstacle | null = null;
    if (android && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const rx = android.rx ?? android.radius;
      const ry = android.ry ?? android.radius;
      const lx = android.x - rect.left;
      const ly = android.y - rect.top;
      if (ly + ry * 2 > 0 && ly - ry * 2 < height + ry * 2) {
        obstacle = { x: lx, y: ly, rx, ry };
      }
    }

    return layoutTextBlocks(entries, width, obstacle).lines;
  }, [width, entries, android, height]);

  return { ref, lines, height };
}
