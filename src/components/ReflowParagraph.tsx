import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { interFont, layoutTextBlocks, type Obstacle, type TextEntry } from '../utils/pretextLayout';

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

const FONT_WEIGHT = {
  regular: 400,
  semibold: 600,
  bold: 700,
} as const;
const REFLOW_OBSTACLE_PAD_X = 12;
const REFLOW_OBSTACLE_PAD_Y = 6;
const REFLOW_RIGHT_SAFE_PAD = 22;

type BlockStyle = {
  font: string;
  lineHeight: number;
  color: string;
  marginTop: number;
};

const getBlockStyle = (kind: ReflowBlock['kind'], compact: boolean): BlockStyle => {
  switch (kind) {
    case 'meta':
      return {
        font: interFont(compact ? FONT_WEIGHT.regular : FONT_WEIGHT.semibold, compact ? 12 : 13),
        lineHeight: compact ? 18 : 20,
        color: '#b58900',
        marginTop: 0,
      };
    case 'heading':
      return {
        font: interFont(compact ? FONT_WEIGHT.semibold : FONT_WEIGHT.bold, compact ? 24 : 27),
        lineHeight: compact ? 30 : 34,
        color: '#333333',
        marginTop: compact ? 4 : 6,
      };
    case 'role':
      return {
        font: interFont(FONT_WEIGHT.regular, compact ? 15 : 17),
        lineHeight: compact ? 23 : 25,
        color: '#586e75',
        marginTop: compact ? 2 : 3,
      };
    case 'stack':
      return {
        font: interFont(FONT_WEIGHT.regular, compact ? 13 : 14),
        lineHeight: compact ? 20 : 22,
        color: '#586e75',
        marginTop: compact ? 7 : 9,
      };
    case 'heroEyebrow':
      return {
        font: interFont(FONT_WEIGHT.semibold, compact ? 11 : 13),
        lineHeight: compact ? 16 : 18,
        color: '#b58900',
        marginTop: 0,
      };
    case 'heroTitle': {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const sz = compact ? 46 : vw <= 1200 ? 48 : vw <= 1500 ? 56 : 62;
      const lh = compact ? 42 : vw <= 1200 ? 45 : vw <= 1500 ? 52 : 58;
      return {
        font: interFont(FONT_WEIGHT.semibold, sz),
        lineHeight: lh,
        color: '#333333',
        marginTop: compact ? 8 : 6,
      };
    }
    case 'heroTitleAccent': {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const sz = compact ? 46 : vw <= 1200 ? 48 : vw <= 1500 ? 56 : 62;
      const lh = compact ? 42 : vw <= 1200 ? 45 : vw <= 1500 ? 52 : 58;
      return {
        font: interFont(FONT_WEIGHT.semibold, sz),
        lineHeight: lh,
        color: '#cb4b16',
        marginTop: compact ? 2 : 2,
      };
    }
    case 'heroSummary':
      return {
        font: interFont(FONT_WEIGHT.regular, compact ? 17 : 21),
        lineHeight: compact ? 26 : 30,
        color: '#333333',
        marginTop: compact ? 12 : 10,
      };
    case 'heroSupporting':
      return {
        font: interFont(FONT_WEIGHT.regular, compact ? 14 : 16),
        lineHeight: compact ? 24 : 25,
        color: '#586e75',
        marginTop: compact ? 8 : 8,
      };
    case 'sectionEyebrow':
      return {
        font: interFont(FONT_WEIGHT.semibold, compact ? 11 : 12),
        lineHeight: compact ? 16 : 18,
        color: '#b58900',
        marginTop: 0,
      };
    case 'sectionTitle':
      return {
        font: interFont(FONT_WEIGHT.semibold, compact ? 34 : 50),
        lineHeight: compact ? 34 : 48,
        color: '#333333',
        marginTop: compact ? 8 : 11,
      };
    case 'sectionCopy':
      return {
        font: interFont(FONT_WEIGHT.regular, compact ? 15 : 16),
        lineHeight: compact ? 25 : 27,
        color: '#586e75',
        marginTop: compact ? 10 : 14,
      };
    case 'projectName':
      return {
        font: interFont(FONT_WEIGHT.bold, compact ? 20 : 23),
        lineHeight: compact ? 26 : 30,
        color: '#333333',
        marginTop: 0,
      };
    case 'projectSummary':
      return {
        font: interFont(FONT_WEIGHT.regular, compact ? 14 : 16),
        lineHeight: compact ? 24 : 27,
        color: '#586e75',
        marginTop: compact ? 10 : 13,
      };
    case 'principleTitle':
      return {
        font: interFont(FONT_WEIGHT.bold, compact ? 17 : 20),
        lineHeight: compact ? 22 : 26,
        color: '#333333',
        marginTop: 0,
      };
    case 'principleBody':
      return {
        font: interFont(FONT_WEIGHT.regular, compact ? 14 : 16),
        lineHeight: compact ? 22 : 27,
        color: '#586e75',
        marginTop: compact ? 8 : 10,
      };
    case 'footerCopy':
      return {
        font: interFont(FONT_WEIGHT.regular, compact ? 14 : 16),
        lineHeight: compact ? 24 : 27,
        color: '#586e75',
        marginTop: 0,
      };
    case 'body':
    default:
      return {
        font: interFont(FONT_WEIGHT.regular, compact ? 16 : 18),
        lineHeight: compact ? 25 : 28,
        color: '#333333',
        marginTop: compact ? 6 : 8,
      };
  }
};

export const ReflowParagraph = ({
  blocks,
  compact,
  androidGlobal = null,
}: ReflowParagraphProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, setWidth] = useState(0);

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
    const layoutWidth = Math.max(40, width - REFLOW_RIGHT_SAFE_PAD);
    const entries: TextEntry[] = blocks.map((block) => {
      const style = getBlockStyle(block.kind, compact);
      return {
        text: block.text,
        font: style.font,
        lineHeight: style.lineHeight,
        color: style.color,
        marginTop: style.marginTop,
      };
    });

    const safeObstacle: Obstacle = {
      x: layoutWidth * 0.5,
      y: compact ? 44 : 50,
      rx: (compact ? 18 : 22) + REFLOW_OBSTACLE_PAD_X,
      ry: (compact ? 24 : 30) + REFLOW_OBSTACLE_PAD_Y,
    };
    const baseLayout = layoutTextBlocks(entries, layoutWidth, null);
    const shapedLayout = layoutTextBlocks(entries, layoutWidth, safeObstacle);

    return {
      entries,
      layoutWidth,
      stableHeight: Math.ceil(Math.max(baseLayout.height, shapedLayout.height)),
    };
  }, [blocks, compact, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !metrics) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;

    const wrapBounds = wrap.getBoundingClientRect();
    const verticalInfluencePx = androidGlobal
      ? (Math.max(androidGlobal.ry ?? androidGlobal.radius, androidGlobal.radius) +
          REFLOW_OBSTACLE_PAD_Y) *
        2
      : 0;
    const androidLocal: Obstacle | null =
      androidGlobal &&
      androidGlobal.y + verticalInfluencePx > wrapBounds.top &&
      androidGlobal.y - verticalInfluencePx < wrapBounds.bottom
        ? {
            x: androidGlobal.x - wrapBounds.left,
            y: androidGlobal.y - wrapBounds.top,
            rx: (androidGlobal.rx ?? androidGlobal.radius) + REFLOW_OBSTACLE_PAD_X,
            ry: (androidGlobal.ry ?? androidGlobal.radius) + REFLOW_OBSTACLE_PAD_Y,
          }
        : null;
    const layout = layoutTextBlocks(metrics.entries, metrics.layoutWidth, androidLocal);
    const finalLines = layout.lines;

    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(metrics.stableHeight * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, metrics.stableHeight);
    context.textBaseline = 'top';

    context.shadowColor = 'rgba(88, 110, 117, 0.12)';
    context.shadowBlur = 7;

    finalLines.forEach((line) => {
      context.font = line.font;
      context.fillStyle = line.color;
      context.globalAlpha = 0.98;
      context.fillText(line.text, line.x, line.y);
    });

    context.shadowBlur = 0;
    context.globalAlpha = 1;

  }, [androidGlobal, metrics, width]);

  const stableHeight = metrics?.stableHeight ?? 220;

  return (
    <Wrap ref={wrapRef} style={{ height: stableHeight }}>
      <Canvas ref={canvasRef} />
      <AccessibleText>{blocks.map((block) => block.text).join(' ')}</AccessibleText>
    </Wrap>
  );
};

const Wrap = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
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
