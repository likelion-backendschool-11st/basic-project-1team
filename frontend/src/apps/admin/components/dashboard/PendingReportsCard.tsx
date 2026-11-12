import { Link } from 'react-router-dom';
import { dashboardCopy, reportsCopy } from '../../data/mockData';
import type { PendingReportSummary } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

interface PendingReportsCardProps {
  readonly reports: readonly PendingReportSummary[];
}

export function PendingReportsCard({ reports }: PendingReportsCardProps) {
  const cols = dashboardCopy.pendingColumns;
  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-error" />
          <h2 className="text-headline-sm font-semibold text-ink">{dashboardCopy.pendingTitle}</h2>
          <Badge tone="danger" shape="code">
            {dashboardCopy.pendingBadge}
          </Badge>
        </div>
        <Link to="/reports" className="group flex items-center gap-1 text-label-md text-primary transition-colors hover:text-ink">
          {dashboardCopy.pendingViewAll}
          <Icon name="arrow_forward" className="!text-[16px] transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="h-9 border-b border-hairline text-eyebrow uppercase text-ink-muted">
              <th className="w-32 pl-4 font-normal">{cols.date}</th>
              <th className="pl-2 font-normal">{cols.content}</th>
              <th className="w-36 pl-2 font-normal">{cols.reason}</th>
              <th className="w-36 pl-2 pr-4 text-right font-normal">{cols.reporter}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {reports.map((r) => (
              <tr key={`${r.contentId}-${r.time}`} className="group h-12 transition-colors hover:bg-surface-2">
                <td className="whitespace-nowrap pl-4 text-body-sm text-ink-muted">
                  {r.date} <span className="font-medium text-ink">{r.time}</span>
                </td>
                <td className="pl-2">
                  <Link to="/reports" className="flex items-center gap-2">
                    <span className="whitespace-nowrap rounded border border-hairline bg-surface-2 px-1.5 py-0.5 font-mono text-body-sm text-ink">
                      #{r.contentId}
                    </span>
                    <span className="max-w-[420px] truncate text-body-md text-ink transition-colors group-hover:text-primary">{r.title ?? reportsCopy.deletedTarget}</span>
                  </Link>
                </td>
                <td className="pl-2">
                  <Badge>{r.reason}</Badge>
                </td>
                <td className="pl-2 pr-4 text-right text-body-sm text-ink-muted">{r.reporter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default PendingReportsCard;
