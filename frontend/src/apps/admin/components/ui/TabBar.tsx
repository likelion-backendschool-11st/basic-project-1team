export interface TabItem<K extends string> {
  readonly key: K;
  readonly label: string;
  readonly count?: number;
  readonly countTone?: 'neutral' | 'danger';
}

interface TabBarProps<K extends string> {
  readonly tabs: readonly TabItem<K>[];
  readonly active: K;
  readonly onChange: (key: K) => void;
}

export function TabBar<K extends string>({ tabs, active, onChange }: TabBarProps<K>) {
  return (
    <div role="tablist" className="mb-6 flex gap-8 border-b border-hairline">
      {tabs.map((tab) => {
        const selected = tab.key === active;
        const countClass =
          tab.countTone === 'danger'
            ? 'rounded-full bg-error-container text-error px-2'
            : `rounded border border-hairline-strong bg-surface-2 px-2 font-mono ${selected ? 'text-ink' : 'text-ink-tertiary'}`;
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-[17px] transition-colors ${
              selected ? 'border-primary-container font-semibold text-ink' : 'border-transparent text-ink-subtle hover:text-ink'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <span className={`py-0.5 text-code-sm ${countClass}`}>{tab.count.toLocaleString()}</span>}
          </button>
        );
      })}
    </div>
  );
}
