import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  layoutNextLine,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';

export type ReflowBlock = {
  kind:
    | 'meta'
    | 'heading'
    | 'role'
    | 'body'
    | 'stack'
    | 'heroEyebrow'
    | 'heroTitle'
    | 'heroTitleAccent'
    | 'heroSummary'
    | 'heroSupporting'
    | 'sectionEyebrow'
    | 'sectionTitle'
    | 'sectionCopy'
    | 'projectName'
    | 'projectSummary'
    | 'principleTitle'
    | 'principleBody'
    | 'footerCopy';
  text: string;
};

type ReflowParagraphProps = {
  blocks: ReflowBlock[];
  compact: boolean;
  androidGlobal?: {
    x: number;
    y: number;
    radius: number;
    intensity: number;
    rx?: number;
    ry?: number;
  } | null;
};

type PositionedLine = {
  x: number;
  y: number;
  text: string;
  font: string;
  color: string;
};

type Interval = {
  left: number;
  right: number;
};

const FONT_STACK =
  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Georgia", serif';
const MIN_SLOT_WIDTH = 56;
const MIN_SLOT_WIDTH_NEAR_OBSTACLE = 100;
const OBSTACLE_PAD_LEFT = 0;
const OBSTACLE_PAD_RIGHT = 0;
const OBSTACLE_PAD_Y = 0;

const preparedCache = new Map<string, PreparedTextWithSegments>();

const getPrepared = (text: string, font: string) => {
  const key = `${font}::${text}`;
  const cached = preparedCache.get(key);
  if (cached) return cached;
  const prepared = prepareWithSegments(text, font);
  preparedCache.set(key, prepared);
  return prepared;
};

const circleIntervalForBand = (
  cx: number,
  cy: number,
  r: number,
  bandTop: number,
  bandBottom: number,
  leftPad: number,
  rightPad: number,
  vPad: number,
) => {
  const top = bandTop - vPad;
  const bottom = bandBottom + vPad;
  if (top >= cy + r || bottom <= cy - r) return null;

  const minDy = cy >= top && cy <= bottom ? 0 : cy < top ? top - cy : cy - bottom;
  if (minDy >= r) return null;

  const maxDx = Math.sqrt(r * r - minDy * minDy);
  return { left: cx - maxDx - leftPad, right: cx + maxDx + rightPad };
};

const ellipseIntervalForBand = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  bandTop: number,
  bandBottom: number,
  leftPad: number,
  rightPad: number,
  vPad: number,
) => {
  const grownRxLeft = rx + leftPad;
  const grownRxRight = rx + rightPad;
  const grownRy = ry + vPad;
  const top = bandTop;
  const bottom = bandBottom;
  if (top >= cy + grownRy || bottom <= cy - grownRy) return null;

  const minDy = cy >= top && cy <= bottom ? 0 : cy < top ? top - cy : cy - bottom;
  if (minDy >= grownRy) return null;

  const yRatio = minDy / grownRy;
  const baseDx = Math.sqrt(1 - yRatio * yRatio);
  const maxDxLeft = grownRxLeft * baseDx;
  const maxDxRight = grownRxRight * baseDx;
  return { left: cx - maxDxLeft, right: cx + maxDxRight };
};

const carveTextLineSlots = (base: Interval, blocked: Interval[], minSlotWidth: number) => {
  let slots: Interval[] = [base];

  for (let blockedIndex = 0; blockedIndex < blocked.length; blockedIndex += 1) {
    const interval = blocked[blockedIndex]!;
    const next: Interval[] = [];

    for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
      const slot = slots[slotIndex]!;
      if (interval.right <= slot.left || interval.left >= slot.right) {
        next.push(slot);
        continue;
      }
      if (interval.left > slot.left) next.push({ left: slot.left, right: interval.left });
      if (interval.right < slot.right) next.push({ left: interval.right, right: slot.right });
    }

    slots = next;
  }

  return slots.filter((slot) => slot.right - slot.left >= minSlotWidth);
};

type BlockStyle = {
  font: string;
  lineHeight: number;
  color: string;
  marginTop: number;
};

type PreparedBlock = {
  prepared: PreparedTextWithSegments;
  style: BlockStyle;
};

const getBlockStyle = (kind: ReflowBlock['kind'], compact: boolean): BlockStyle => {
  switch (kind) {
    case 'meta':
      return {
        font: `${compact ? 500 : 600} ${compact ? 13 : 14}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 20 : 22,
        color: '#ffb36a',
        marginTop: 0,
      };
    case 'heading':
      return {
        font: `${compact ? 600 : 700} ${compact ? 28 : 32}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 33 : 38,
        color: '#f7eddc',
        marginTop: compact ? 4 : 6,
      };
    case 'role':
      return {
        font: `${compact ? 500 : 500} ${compact ? 17 : 19}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 25 : 27,
        color: '#c2b4a0',
        marginTop: compact ? 2 : 3,
      };
    case 'stack':
      return {
        font: `${compact ? 400 : 400} ${compact ? 14 : 15}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 22 : 24,
        color: '#e5d8c4',
        marginTop: compact ? 7 : 9,
      };
    case 'heroEyebrow':
      return {
        font: `600 ${compact ? 11 : 13}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 16 : 18,
        color: '#ffb36a',
        marginTop: 0,
      };
    case 'heroTitle': {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const sz = compact ? 48 : vw <= 1100 ? 56 : 80;
      const lh = compact ? 44 : vw <= 1100 ? 52 : 72;
      return {
        font: `600 ${sz}px "MisoText", ${FONT_STACK}`,
        lineHeight: lh,
        color: '#f7eddc',
        marginTop: compact ? 8 : 12,
      };
    }
    case 'heroTitleAccent': {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const sz = compact ? 48 : vw <= 1100 ? 56 : 80;
      const lh = compact ? 44 : vw <= 1100 ? 52 : 72;
      return {
        font: `600 ${sz}px "MisoText", ${FONT_STACK}`,
        lineHeight: lh,
        color: '#ff7a1a',
        marginTop: compact ? 2 : 4,
      };
    }
    case 'heroSummary':
      return {
        font: `400 ${compact ? 17 : 21}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 26 : 33,
        color: '#f7eddc',
        marginTop: compact ? 12 : 18,
      };
    case 'heroSupporting':
      return {
        font: `400 ${compact ? 14 : 16}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 24 : 27,
        color: '#c2b4a0',
        marginTop: compact ? 8 : 12,
      };
    case 'sectionEyebrow':
      return {
        font: `600 ${compact ? 11 : 12}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 16 : 18,
        color: '#ffb36a',
        marginTop: 0,
      };
    case 'sectionTitle':
      return {
        font: `600 ${compact ? 34 : 50}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 34 : 48,
        color: '#f7eddc',
        marginTop: compact ? 8 : 11,
      };
    case 'sectionCopy':
      return {
        font: `400 ${compact ? 15 : 16}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 25 : 27,
        color: '#c2b4a0',
        marginTop: compact ? 10 : 14,
      };
    case 'projectName':
      return {
        font: `700 ${compact ? 20 : 23}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 26 : 30,
        color: '#f7eddc',
        marginTop: 0,
      };
    case 'projectSummary':
      return {
        font: `400 ${compact ? 14 : 16}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 24 : 27,
        color: '#c2b4a0',
        marginTop: compact ? 10 : 13,
      };
    case 'principleTitle':
      return {
        font: `700 ${compact ? 17 : 20}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 22 : 26,
        color: '#f7eddc',
        marginTop: 0,
      };
    case 'principleBody':
      return {
        font: `400 ${compact ? 14 : 16}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 22 : 27,
        color: '#c2b4a0',
        marginTop: compact ? 8 : 10,
      };
    case 'footerCopy':
      return {
        font: `400 ${compact ? 14 : 16}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 24 : 27,
        color: '#c2b4a0',
        marginTop: 0,
      };
    case 'body':
    default:
      return {
        font: `${compact ? 400 : 400} ${compact ? 18 : 20}px "MisoText", ${FONT_STACK}`,
        lineHeight: compact ? 28 : 31,
        color: '#f7eddc',
        marginTop: compact ? 6 : 8,
      };
  }
};

const layoutBlockAroundObstacle = (
  prepared: PreparedTextWithSegments,
  style: BlockStyle,
  width: number,
  startY: number,
  android:
    | {
        x: number;
        y: number;
        radius: number;
        rx?: number;
        ry?: number;
      }
    | null,
) => {
  const lines: PositionedLine[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let lineTop = startY;
  let exhausted = false;
  let guard = 0;

  while (!exhausted && guard < 80) {
    const bandTop = lineTop;
    const bandBottom = lineTop + style.lineHeight;
    const blocked: Interval[] = [];
    let nearObstacleBand = false;
    if (android) {
      const interval =
        android.rx && android.ry
          ? ellipseIntervalForBand(
              android.x,
              android.y,
              android.rx,
              android.ry,
              bandTop,
              bandBottom,
              OBSTACLE_PAD_LEFT,
              OBSTACLE_PAD_RIGHT,
              OBSTACLE_PAD_Y,
            )
          : circleIntervalForBand(
              android.x,
              android.y,
              android.radius,
              bandTop,
              bandBottom,
              OBSTACLE_PAD_LEFT,
              OBSTACLE_PAD_RIGHT,
              OBSTACLE_PAD_Y,
            );
      if (interval) {
        blocked.push(interval);
        nearObstacleBand = true;
      }
    }
    const minSlotWidth = nearObstacleBand ? MIN_SLOT_WIDTH_NEAR_OBSTACLE : MIN_SLOT_WIDTH;
    const slots = carveTextLineSlots({ left: 0, right: width }, blocked, minSlotWidth).sort(
      (a, b) => a.left - b.left,
    );

    if (slots.length === 0) {
      lineTop += style.lineHeight;
      guard += 1;
      continue;
    }

    for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
      const slot = slots[slotIndex]!;
      const line = layoutNextLine(prepared, cursor, slot.right - slot.left);
      if (line === null) {
        exhausted = true;
        break;
      }

      lines.push({
        x: Math.round(slot.left),
        y: Math.round(lineTop),
        text: line.text,
        font: style.font,
        color: style.color,
      });
      cursor = line.end;
    }
    lineTop += style.lineHeight;
    guard += 1;
  }

  return {
    lines,
    nextY: lineTop,
  };
};

export const ReflowParagraph = ({
  blocks,
  compact,
  androidGlobal = null,
}: ReflowParagraphProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(220);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const update = () => {
      const nextWidth = Math.max(40, Math.floor(wrap.clientWidth));
      setWidth((current) => (current === nextWidth ? current : nextWidth));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const metrics = useMemo(() => {
    if (width <= 0) return null;
    const preparedBlocks: PreparedBlock[] = blocks.map((block) => {
      const style = getBlockStyle(block.kind, compact);
      return {
        prepared: getPrepared(block.text, style.font),
        style,
      };
    });
    const safeAndroid = {
      x: width * 0.5,
      y: compact ? 44 : 50,
      radius: compact ? 18 : 22,
      rx: compact ? 18 : 22,
      ry: compact ? 24 : 30,
    };
    let baseY = compact ? 6 : 8;
    let shapedY = compact ? 6 : 8;

    for (let i = 0; i < preparedBlocks.length; i += 1) {
      const block = preparedBlocks[i]!;
      baseY += block.style.marginTop;
      shapedY += block.style.marginTop;
      const baseResult = layoutBlockAroundObstacle(block.prepared, block.style, width, baseY, null);
      const shapedResult = layoutBlockAroundObstacle(
        block.prepared,
        block.style,
        width,
        shapedY,
        safeAndroid,
      );
      baseY = baseResult.nextY;
      shapedY = shapedResult.nextY;
    }

    return {
      preparedBlocks,
      stableHeight: Math.ceil(Math.max(baseY, shapedY) + (compact ? 10 : 12)),
    };
  }, [blocks, compact, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !metrics) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    if (metrics.stableHeight !== height) {
      setHeight(metrics.stableHeight);
    }

    const wrapBounds = wrap.getBoundingClientRect();
    const verticalInfluence = androidGlobal
      ? Math.max(androidGlobal.ry ?? androidGlobal.radius, androidGlobal.radius) * 2
      : 0;
    const androidLocal =
      androidGlobal &&
      androidGlobal.y + verticalInfluence > wrapBounds.top &&
      androidGlobal.y - verticalInfluence < wrapBounds.bottom
        ? {
            x: androidGlobal.x - wrapBounds.left,
            y: androidGlobal.y - wrapBounds.top,
            radius: androidGlobal.radius,
            intensity: androidGlobal.intensity,
            rx: androidGlobal.rx,
            ry: androidGlobal.ry,
          }
        : null;
    const finalLines: PositionedLine[] = [];
    let yCursor = compact ? 6 : 8;
    for (let i = 0; i < metrics.preparedBlocks.length; i += 1) {
      const block = metrics.preparedBlocks[i]!;
      yCursor += block.style.marginTop;
      const layout = layoutBlockAroundObstacle(block.prepared, block.style, width, yCursor, androidLocal);
      finalLines.push(...layout.lines);
      yCursor = layout.nextY;
    }

    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(metrics.stableHeight * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, metrics.stableHeight);
    context.textBaseline = 'top';

    context.shadowColor = 'rgba(247, 237, 220, 0.16)';
    context.shadowBlur = 7;

    finalLines.forEach((line) => {
      context.font = line.font;
      context.fillStyle = line.color;
      context.globalAlpha = 0.98;
      context.fillText(line.text, line.x, line.y);
    });

    context.shadowBlur = 0;
    context.globalAlpha = 1;

  }, [androidGlobal, height, metrics, width]);

  return (
    <Wrap ref={wrapRef} style={{ height }}>
      <Canvas ref={canvasRef} />
      <AccessibleText>{blocks.map((block) => block.text).join(' ')}</AccessibleText>
    </Wrap>
  );
};

const Wrap = styled.div`
  position: relative;
  width: 100%;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const AccessibleText = styled.p`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
