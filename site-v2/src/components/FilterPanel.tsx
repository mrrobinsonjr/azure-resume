type FilterPanelProps = {
  facets: {
    tech: string[];
    tags: string[];
    il: string[];
    clr: string[];
  };
  selected: {
    tech: Set<string>;
    tags: Set<string>;
    il: Set<string>;
    clr: Set<string>;
  };
  onToggle: (group: "tech" | "tags" | "il" | "clr", value: string) => void;
  onClearAll: () => void;
};

function Group({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const active = selected.has(value);
          return (
            <button
              key={`${label}-${value}`}
              type="button"
              onClick={() => onToggle(value)}
              className={`rounded-full border px-2 py-1 text-xs ${
                active
                  ? "border-brand-500 bg-brand-500/20 text-brand-500"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterPanel({ facets, selected, onToggle, onClearAll }: FilterPanelProps) {
  return (
    <div className="mt-4 space-y-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Filters</p>
        <button type="button" onClick={onClearAll} className="text-xs font-semibold text-brand-500 hover:text-brand-600">
          Clear all
        </button>
      </div>
      <Group label="IL" values={facets.il} selected={selected.il} onToggle={(v) => onToggle("il", v)} />
      <Group label="Clearance" values={facets.clr} selected={selected.clr} onToggle={(v) => onToggle("clr", v)} />
      <Group label="Tags" values={facets.tags} selected={selected.tags} onToggle={(v) => onToggle("tags", v)} />
      <Group label="Tech" values={facets.tech} selected={selected.tech} onToggle={(v) => onToggle("tech", v)} />
    </div>
  );
}

export default FilterPanel;
