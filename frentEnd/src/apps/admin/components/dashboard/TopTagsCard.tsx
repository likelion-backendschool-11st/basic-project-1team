import { Link } from 'react-router-dom';
import { dashboardCopy, ui } from '../../data/mockData';
import type { TopTag } from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';

interface TopTagsCardProps {
  readonly tags: readonly TopTag[];
  readonly className?: string;
}

function barColor(rank: number): string {
  if (rank <= 3) return 'bg-primary-container';
  if (rank <= 6) return 'bg-brand-secure';
  return 'bg-hairline-strong';
}

export function TopTagsCard({ tags, className = '' }: TopTagsCardProps) {
  const cols = dashboardCopy.topTagsColumns;
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader icon="tag" title={dashboardCopy.topTagsTitle} />
      <div className="custom-scrollbar mt-3 max-h-[360px] flex-1 overflow-y-auto pr-1">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="h-7 border-b border-hairline text-eyebrow uppercase text-ink-muted">
              <th className="w-10 text-center font-normal">{cols.rank}</th>
              <th className="pl-2 font-normal">{cols.name}</th>
              <th className="pr-2 text-right font-normal">{cols.count}</th>
              <th className="w-24 pr-1 text-right font-normal">{cols.share}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline/60">
            {tags.map((tag) => (
              <tr key={tag.name} className="group h-8 transition-colors hover:bg-surface-2">
                <td className={`text-center text-body-sm ${tag.rank <= 3 ? 'font-medium text-primary' : 'text-ink-muted'}`}>
                  {String(tag.rank).padStart(2, '0')}
                </td>
                <td className="pl-2">
                  <Link to="/tags" className="font-mono text-body-sm text-ink group-hover:text-primary">
                    {tag.name}
                  </Link>
                </td>
                <td className="whitespace-nowrap pr-2 text-right text-body-sm text-ink-muted">
                  {tag.count.toLocaleString()}
                  {ui.countUnit}
                </td>
                <td className="pr-1">
                  <div className="flex h-1.5 w-full justify-end overflow-hidden rounded-full bg-surface-2">
                    <div className={`h-full rounded-full ${barColor(tag.rank)}`} style={{ width: `${tag.share}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default TopTagsCard;
