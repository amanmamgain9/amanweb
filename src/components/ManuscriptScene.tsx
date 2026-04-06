import { useEffect, useRef, type MutableRefObject } from 'react';
import styled from 'styled-components';
import {
  layoutNextLine,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';
import type { ExperienceEntry } from '../data/homeContent';

type ExperienceTransition = {
  from: number;
  to: number;
  progress: number;
  animating: boolean;
};

type ManuscriptSceneProps = {
  experiences: ExperienceEntry[];
  activeIndex: number;
  compact: boolean;
  transition: ExperienceTransition;
  stackRef: MutableRefObject<HTMLDivElement | null>;
  narrativeRefs: MutableRefObject<(HTMLDivElement | null)[]>;
};

type Interval = {
  left: number;
  right: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Orb = {
  x: number;
  y: number;
  radius: number;
};

type PositionedLine = {
  x: number;
  y: number;
  width: number;
  text: string;
  scramble: number;
};

type PreparedBlock = {
  prepared: PreparedTextWithSegments;
  key: string;
};

const MIN_SLOT_WIDTH = 56;
const SCRAMBLE_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const TEXT_COLOR = '#f7eddc';
const ORB_COLOR = 'rgba(248, 218, 162, 0.94)';
const MANUSCRIPT_FONT_STACK =
  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Georgia", serif';

const preparedCache = new Map<string, PreparedTextWithSegments>();

const random = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const scrambleText = (text: string, intensity: number, phase: number) => {
  if (intensity <= 0.06) return text;

  return Array.from(text)
    .map((char, index) => {
      if (char === ' ') return char;
      if (random(phase * 0.017 + index + char.charCodeAt(0)) > intensity) return char;
      return SCRAMBLE_SET[Math.floor(random(phase + index * 0.31) * SCRAMBLE_SET.length)] ?? char;
    })
    .join('');
};

const getPrepared = (text: string, font: string): PreparedBlock => {
  const key = `${font}::${text}`;
  const cached = preparedCache.get(key);
  if (cached) return { prepared: cached, key };
  const prepared = prepareWithSegments(text, font);
  preparedCache.set(key, prepared);
  return { prepared, key };
};

const getExperienceText = (entry: ExperienceEntry) =>
  [entry.summary, ...entry.highlights].join(' ');

const circleIntervalForBand = (
  cx: number,
  cy: number,
  r: number,
  bandTop: number,
  bandBottom: number,
  hPad: number,
  vPad: number,
) => {
  const top = bandTop - vPad;
  const bottom = bandBottom + vPad;
  if (top >= cy + r || bottom <= cy - r) return null;

  const minDy = cy >= top && cy <= bottom ? 0 : cy < top ? top - cy : cy - bottom;
  if (minDy >= r) return null;

  const maxDx = Math.sqrt(r * r - minDy * minDy);
  return { left: cx - maxDx - hPad, right: cx + maxDx + hPad };
};

const carveTextLineSlots = (base: Interval, blocked: Interval[]) => {
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

  return slots.filter((slot) => slot.right - slot.left >= MIN_SLOT_WIDTH);
};

const circleInfluenceAt = (orb: Orb, x: number, y: number) => {
  const dx = x - orb.x;
  const dy = y - orb.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const limit = orb.radius * 1.8;
  if (distance >= limit) return 0;
  const value = 1 - distance / limit;
  return Math.min(1, value * value);
};

const layoutParagraphAroundOrb = (
  prepared: PreparedTextWithSegments,
  region: Rect,
  lineHeight: number,
  orb: Orb,
) => {
  const lines: PositionedLine[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let lineTop = region.y + 2;
  let exhausted = false;

  while (lineTop + lineHeight <= region.y + region.height + lineHeight * 0.4 && !exhausted) {
    const bandTop = lineTop;
    const bandBottom = lineTop + lineHeight;
    const blocked: Interval[] = [];
    const interval = circleIntervalForBand(
      orb.x,
      orb.y,
      orb.radius,
      bandTop,
      bandBottom,
      16,
      4,
    );
    if (interval !== null) blocked.push(interval);

    const slots = carveTextLineSlots(
      { left: region.x, right: region.x + region.width },
      blocked,
    ).sort((a, b) => a.left - b.left);

    if (slots.length === 0) {
      lineTop += lineHeight;
      continue;
    }

    for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
      const slot = slots[slotIndex]!;
      const line = layoutNextLine(prepared, cursor, slot.right - slot.left);
      if (line === null) {
        exhausted = true;
        break;
      }

      const centerX = slot.left + line.width / 2;
      const centerY = lineTop + lineHeight * 0.45;
      lines.push({
        x: Math.round(slot.left),
        y: Math.round(lineTop),
        width: line.width,
        text: line.text,
        scramble: circleInfluenceAt(orb, centerX, centerY),
      });
      cursor = line.end;
    }

    lineTop += lineHeight;
  }

  return lines;
};

export const ManuscriptScene = ({
  experiences,
  activeIndex,
  compact,
  transition,
  stackRef,
  narrativeRefs,
}: ManuscriptSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frame = 0;

    const render = (now: number) => {
      const context = canvas.getContext('2d');
      if (!context) return;

      const rect = stackRef.current?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      if (!stackRef.current) {
        frame = window.requestAnimationFrame(render);
        return;
      }

      const fontSize = compact ? 16 : 17;
      const lineHeight = compact ? 25 : 27;
      const font = `${fontSize}px "MisoText", ${MANUSCRIPT_FONT_STACK}`;
      context.font = font;
      context.textBaseline = 'top';

      const sourceNode = narrativeRefs.current[transition.from];
      const targetNode = narrativeRefs.current[transition.to] ?? narrativeRefs.current[activeIndex];
      if (!sourceNode || !targetNode) {
        frame = window.requestAnimationFrame(render);
        return;
      }

      if (!transition.animating) {
        frame = window.requestAnimationFrame(render);
        return;
      }

      const stackBounds = stackRef.current.getBoundingClientRect();
      const sourceBounds = sourceNode.getBoundingClientRect();
      const targetBounds = targetNode.getBoundingClientRect();

      const sourceRegion: Rect = {
        x: sourceBounds.left - stackBounds.left,
        y: sourceBounds.top - stackBounds.top,
        width: sourceBounds.width,
        height: sourceBounds.height,
      };
      const targetRegion: Rect = {
        x: targetBounds.left - stackBounds.left,
        y: targetBounds.top - stackBounds.top,
        width: targetBounds.width,
        height: targetBounds.height,
      };

      const fromAnchor = {
        x: sourceRegion.x + sourceRegion.width * 0.52,
        y: sourceRegion.y + Math.min(sourceRegion.height * 0.42, lineHeight * 2.4),
      };
      const toAnchor = {
        x: targetRegion.x + targetRegion.width * 0.52,
        y: targetRegion.y + Math.min(targetRegion.height * 0.42, lineHeight * 2.4),
      };
      const orb: Orb = {
        x: fromAnchor.x + (toAnchor.x - fromAnchor.x) * transition.progress,
        y: fromAnchor.y + (toAnchor.y - fromAnchor.y) * transition.progress,
        radius: compact ? 52 : 64,
      };

      const sourceEntry =
        experiences[Math.max(0, Math.min(transition.from, experiences.length - 1))] ??
        experiences[0]!;
      const sourcePrepared = getPrepared(getExperienceText(sourceEntry), font);
      const reflowedLines = layoutParagraphAroundOrb(
        sourcePrepared.prepared,
        sourceRegion,
        lineHeight,
        orb,
      );

      const glow = context.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * 2.2);
      glow.addColorStop(0, 'rgba(248, 218, 162, 0.92)');
      glow.addColorStop(0.36, 'rgba(230, 164, 86, 0.32)');
      glow.addColorStop(1, 'rgba(230, 164, 86, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(orb.x, orb.y, orb.radius * 2.2, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = TEXT_COLOR;
      context.shadowColor = 'rgba(247, 237, 220, 0.2)';
      context.shadowBlur = 8;

      reflowedLines.forEach((line, index) => {
        const xJitter = Math.sin(now * 0.022 + index * 1.4) * line.scramble * 10;
        const yJitter = Math.cos(now * 0.018 + index * 1.1) * line.scramble * 2.5;
        const scramble = Math.min(0.75, line.scramble * 0.85);
        context.globalAlpha = Math.max(0.5, 0.98 - line.scramble * 0.12);
        context.fillText(
          scrambleText(line.text, scramble, now * 0.026 + index * 13),
          line.x + xJitter,
          line.y + yJitter,
        );
      });

      context.shadowBlur = 0;
      context.globalAlpha = 1;

      context.fillStyle = ORB_COLOR;
      context.beginPath();
      context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = 'rgba(255, 241, 208, 0.76)';
      context.lineWidth = 1.4;
      context.beginPath();
      context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      context.stroke();

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex, compact, experiences, narrativeRefs, stackRef, transition]);

  return (
    <SceneFrame>
      <SceneCanvas ref={canvasRef} />
    </SceneFrame>
  );
};

const SceneFrame = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
`;

const SceneCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;
