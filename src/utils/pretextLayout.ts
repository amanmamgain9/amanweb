import {
  clearCache as pretextClearCache,
  layoutNextLine,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';

// ── Types ──────────────────────────────────────────────────────────

export type TextEntry = {
  text: string;
  font: string;
  lineHeight: number;
  color: string;
  marginTop: number;
};

export type PretextLine = {
  x: number;
  y: number;
  text: string;
  font: string;
  color: string;
};

export type Obstacle = { x: number; y: number; rx: number; ry: number };

// ── Font helper ────────────────────────────────────────────────────

export const interFont = (weight: number, size: number) =>
  `${weight} ${size}px "Inter"`;

// ── Cache ──────────────────────────────────────────────────────────

const cache = new Map<string, PreparedTextWithSegments>();

const getPrepared = (text: string, font: string): PreparedTextWithSegments => {
  const k = `${font}::${text}`;
  let p = cache.get(k);
  if (!p) {
    p = prepareWithSegments(text, font);
    cache.set(k, p);
  }
  return p;
};

export function clearAllCaches() {
  cache.clear();
  pretextClearCache();
}

// ── Geometry ───────────────────────────────────────────────────────

type Interval = { left: number; right: number };

const MIN_SLOT = 56;
const MIN_SLOT_NEAR = 100;

const ellipseInterval = (
  cx: number, cy: number, rx: number, ry: number,
  bandTop: number, bandBottom: number,
): Interval | null => {
  if (bandTop >= cy + ry || bandBottom <= cy - ry) return null;
  const minDy =
    cy >= bandTop && cy <= bandBottom
      ? 0
      : cy < bandTop
        ? bandTop - cy
        : cy - bandBottom;
  if (minDy >= ry) return null;
  const dx = rx * Math.sqrt(1 - (minDy / ry) ** 2);
  return { left: cx - dx, right: cx + dx };
};

const carveSlots = (base: Interval, blocked: Interval[], minWidth: number): Interval[] => {
  let slots = [base];
  for (const b of blocked) {
    const next: Interval[] = [];
    for (const s of slots) {
      if (b.right <= s.left || b.left >= s.right) { next.push(s); continue; }
      if (b.left > s.left) next.push({ left: s.left, right: b.left });
      if (b.right < s.right) next.push({ left: b.right, right: s.right });
    }
    slots = next;
  }
  return slots.filter((s) => s.right - s.left >= minWidth);
};

// ── Layout ─────────────────────────────────────────────────────────

export function layoutTextBlocks(
  entries: TextEntry[],
  width: number,
  obstacle: Obstacle | null,
): { lines: PretextLine[]; height: number } {
  if (width <= 0 || entries.length === 0) return { lines: [], height: 0 };

  const allLines: PretextLine[] = [];
  let y = 0;

  for (const entry of entries) {
    y += entry.marginTop;
    const prepared = getPrepared(entry.text, entry.font);
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
    let lineTop = y;

    for (let guard = 0; guard < 300; guard++) {
      const bandTop = lineTop;
      const bandBottom = lineTop + entry.lineHeight;
      const blocked: Interval[] = [];
      let near = false;

      if (obstacle) {
        const iv = ellipseInterval(obstacle.x, obstacle.y, obstacle.rx, obstacle.ry, bandTop, bandBottom);
        if (iv) { blocked.push(iv); near = true; }
      }

      const slots = carveSlots({ left: 0, right: width }, blocked, near ? MIN_SLOT_NEAR : MIN_SLOT);

      if (slots.length === 0) { lineTop += entry.lineHeight; continue; }

      const slot = slots.reduce((a, b) => (b.right - b.left > a.right - a.left ? b : a));
      const line = layoutNextLine(prepared, cursor, slot.right - slot.left);
      if (!line) break;
      allLines.push({
        x: Math.round(slot.left),
        y: Math.round(lineTop),
        text: line.text.trimEnd(),
        font: entry.font,
        color: entry.color,
      });
      cursor = line.end;
      lineTop += entry.lineHeight;
    }
    y = lineTop;
  }

  const lastLh = entries[entries.length - 1].lineHeight;
  return { lines: allLines, height: Math.ceil(y + Math.max(lastLh * 0.3, 6)) };
}
