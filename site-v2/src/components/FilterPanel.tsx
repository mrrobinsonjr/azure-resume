import type { FilterState } from "../types/roles";

type FilterGroup = "tech" | "tags" | "il" | "clr";

type Facets = {
  tech: string[];
  tags: string[];
  il: string[];
  clr: string[];
};

type FilterPanelProps = {
  facets: Facets;
  selected: FilterState;
  onToggle: (group: FilterGroup, value: string) => void;
  onClearAll: () => void;
};

type GroupProps = {
  label: string;
  group: FilterGroup;
  items: string[];
  selected: Set<string>;
  onToggle: (group: FilterGroup, value: string) => void;
};

function Group({ label, group, items, selected, onToggle }: GroupProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = selected.has(item);
          return (
            <button
              key={`${group}-${item}`}
              type="button"
              onClick={() => onToggle(group, item)}
              className={
                active
                  ? "rounded-full border border-brand-500 bg-brand-500/10 px-3 py-1 text-xs text-brand-300"
                  : "rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-200"
              }
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterPanel({ facets, selected, onToggle, onClearAll }: FilterPanelProps) {
  return (
    <div className="mt-4 space-y-4 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-200">Filters</p>
        <button type="button" onClick={onClearAll} className="text-xs font-semibold text-brand-500 hover:text-brand-600">
          Clear all
        </button>
      </div>

      <Group label="IL Levels" group="il" items={facets.il} selected={selected.il} onToggle={onToggle} />
      <Group label="Clearance" group="clr" items={facets.clr} selected={selected.clr} onToggle={onToggle} />
      <Group label="Tags" group="tags" items={facets.tags} selected={selected.tags} onToggle={onToggle} />
      <Group label="Tech" group="tech" items={facets.tech} selected={selected.tech} onToggle={onToggle} />
    </div>
  );
}

export default FilterPanel;
