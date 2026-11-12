import React, { useId } from 'react';
import { dashboardCopy, ui } from '../../data/mockData';
import { useTrendChart } from '../../hooks/useTrendChart';
import type { TrendPoint } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';

interface TrendChartProps {
  readonly data: readonly TrendPoint[];
  readonly yTicks: readonly number[];
  readonly className?: string;
}

const Legend: React.FC = () => {
  return (
    <div className="flex items-center gap-4 text-body-sm">
      <span className="flex items-center gap-1.5">
        <span className="h-1 w-3 rounded-full bg-primary-container" />
        <span className="font-medium text-ink">{dashboardCopy.trendLegend.questions}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-1 w-3 rounded-full bg-tertiary" />
        <span className="font-medium text-ink">{dashboardCopy.trendLegend.signups}</span>
      </span>
    </div>
  );
};

/** 7-day dual-line area chart. Colors come from theme classes via `currentColor`. */
export const TrendChart: React.FC<TrendChartProps> = ({ data, yTicks, className = '' }) => {
  const g = useTrendChart(data, yTicks);
  const uid = useId().replace(/:/g, '');
  const qGrad = `q-grad-${uid}`;
  const sGrad = `s-grad-${uid}`;
  const tooltip = g.peak
    ? `${dashboardCopy.trendTooltipPrefix}: ${g.peak.value}${ui.countUnit}`
    : '';

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader
        icon="insights"
        title={dashboardCopy.trendTitle}
        subtitle={dashboardCopy.trendSubtitle}
        aside={<Legend />}
      />
      <div className="relative mt-4 h-[280px] w-full">
        {data.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-body-sm text-ink-muted">
            {dashboardCopy.emptyOptional}
          </p>
        )}
        <svg
          className="h-full w-full overflow-visible"
          viewBox={`0 0 ${g.width} ${g.height + 10}`}
          fill="none"
          role="img"
          aria-label={dashboardCopy.trendSubtitle}
        >
          <defs>
            <linearGradient
              id={qGrad}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
              className="text-primary-container"
            >
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={sGrad} x1="0" x2="0" y1="0" y2="1" className="text-tertiary">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g className="text-hairline">
            {g.gridLines.map((line) => (
              <line
                key={line.value}
                x1={g.plotLeft}
                x2={g.plotRight}
                y1={line.y}
                y2={line.y}
                stroke="currentColor"
                strokeDasharray={line.y === g.plotBottom ? undefined : '3 3'}
              />
            ))}
          </g>
          {g.gridLines.map((line) => (
            <text
              key={line.value}
              x={36}
              y={line.y + 4}
              textAnchor="end"
              fontSize={12}
              fontWeight={500}
              className="fill-ink-subtle font-mono"
            >
              {line.value}
            </text>
          ))}

          <path d={g.questionArea} fill={`url(#${qGrad})`} />
          <path
            d={g.questionLine}
            className="text-primary-container"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <path d={g.signupArea} fill={`url(#${sGrad})`} />
          <path
            d={g.signupLine}
            className="text-tertiary"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="4 2"
            strokeLinecap="round"
          />

          {g.questionPoints.map((p, i) => {
            const isPeak = data[i]?.emphasis === 'peak';
            return (
              <circle
                key={`q-${p.x}`}
                cx={p.x}
                cy={p.y}
                r={isPeak ? 4.5 : 3.5}
                strokeWidth={2}
                className={
                  isPeak
                    ? 'fill-primary-container stroke-primary'
                    : 'fill-surface-1 stroke-primary-container'
                }
              />
            );
          })}
          {g.signupPoints.map((p) => (
            <circle
              key={`s-${p.x}`}
              cx={p.x}
              cy={p.y}
              r={3}
              strokeWidth={1.5}
              className="fill-surface-1 stroke-tertiary"
            />
          ))}

          {g.peak && (
            <g transform={`translate(${g.peak.x - 51}, ${g.peak.y - 40})`}>
              <rect
                width={102}
                height={28}
                rx={6}
                strokeWidth={1}
                className="fill-surface-2 stroke-hairline-strong"
              />
              <text
                x={51}
                y={18}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                className="fill-ink font-sans"
              >
                {tooltip}
              </text>
            </g>
          )}

          {g.xLabels.map((l) => (
            <text
              key={l.label}
              x={l.x}
              y={g.height}
              textAnchor="middle"
              fontSize={13}
              fontWeight={l.emphasis ? 600 : 500}
              className={`font-mono ${l.emphasis === 'today' ? 'fill-primary' : l.emphasis === 'peak' ? 'fill-ink' : 'fill-ink-subtle'}`}
            >
              {l.label}
            </text>
          ))}
        </svg>
      </div>
    </Card>
  );
};
