import { useMemo } from 'react';
import type { TrendPoint } from '../types';

export interface ChartPoint {
  readonly x: number;
  readonly y: number;
}

export interface TrendChartGeometry {
  readonly width: number;
  readonly height: number;
  readonly plotLeft: number;
  readonly plotRight: number;
  readonly plotBottom: number;
  readonly gridLines: readonly { readonly y: number; readonly value: number }[];
  readonly questionPoints: readonly ChartPoint[];
  readonly signupPoints: readonly ChartPoint[];
  readonly questionLine: string;
  readonly questionArea: string;
  readonly signupLine: string;
  readonly signupArea: string;
  readonly xLabels: readonly {
    readonly x: number;
    readonly label: string;
    readonly emphasis?: TrendPoint['emphasis'];
  }[];
  readonly peak?: { readonly x: number; readonly y: number; readonly value: number };
}

const WIDTH = 620;
const HEIGHT = 220;
const PLOT_LEFT = 44;
const PLOT_RIGHT = 600;
const PLOT_TOP = 20;
const PLOT_BOTTOM = 200;
const FIRST_X = 70;
const LAST_X = 580;

/** Catmull-Rom → cubic Bézier, giving the smooth curve from the Stitch mock. */
function smoothPath(points: readonly ChartPoint[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  let d = `M ${first.x} ${first.y}`;
  rest.forEach((point, index) => {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = point;
    const p3 = points[index + 2] ?? point;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  });
  return d;
}

function areaPath(points: readonly ChartPoint[], line: string): string {
  if (points.length === 0) return '';
  const last = points[points.length - 1];
  return `${line} L ${last.x} ${PLOT_BOTTOM} L ${points[0].x} ${PLOT_BOTTOM} Z`;
}

/** Maps trend data onto the 620×220 SVG canvas used by the Stitch design. */
export function useTrendChart(
  data: readonly TrendPoint[],
  yTicks: readonly number[],
): TrendChartGeometry {
  return useMemo(() => {
    const yMax = Math.max(...yTicks, 1);
    const step = data.length > 1 ? (LAST_X - FIRST_X) / (data.length - 1) : 0;
    const toY = (value: number) => PLOT_BOTTOM - (value / yMax) * (PLOT_BOTTOM - PLOT_TOP);

    const questionPoints = data.map((d, i) => ({ x: FIRST_X + step * i, y: toY(d.questions) }));
    const signupPoints = data.map((d, i) => ({ x: FIRST_X + step * i, y: toY(d.signups) }));
    const questionLine = smoothPath(questionPoints);
    const signupLine = smoothPath(signupPoints);

    const peakIndex = data.findIndex((d) => d.emphasis === 'peak');
    const peak =
      peakIndex >= 0
        ? {
            x: questionPoints[peakIndex].x,
            y: questionPoints[peakIndex].y,
            value: data[peakIndex].questions,
          }
        : undefined;

    return {
      width: WIDTH,
      height: HEIGHT,
      plotLeft: PLOT_LEFT,
      plotRight: PLOT_RIGHT,
      plotBottom: PLOT_BOTTOM,
      gridLines: yTicks.map((value) => ({ value, y: toY(value) })),
      questionPoints,
      signupPoints,
      questionLine,
      questionArea: areaPath(questionPoints, questionLine),
      signupLine,
      signupArea: areaPath(signupPoints, signupLine),
      xLabels: data.map((d, i) => ({
        x: FIRST_X + step * i,
        label: d.label,
        emphasis: d.emphasis,
      })),
      peak,
    };
  }, [data, yTicks]);
}
