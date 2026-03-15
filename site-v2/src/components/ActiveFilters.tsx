import type { FilterState } from "../types/roles";

type FilterGroup = "tech" | "tags" | "il" | "clr";

type ActiveFiltersProps = {
  selected: FilterState;
  onRemove: (group: FilterGroup, value: string) => void;
};

function ActiveFilters({ selected, onRemove }: ActiveFiltersProps) {
  const items: Array<{ group: FilterGroup; value: string }> = [
    ...[...selected.tech].map((value) => ({ group: "tech" as const, value })),
    ...[...selected.tags].map((value) => ({ group: "tags" as const, value })),
    ...[...selected.il].map((value) => ({ group: "il" as const, value })),
    ...[...selected.clr].map((value) => ({ group: "clr" as const, value })),
  ];

  if (items.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map(({ group, value }) => (
        <button
          key={`${group}-${value}`}
          type="button"
          onClick={() => onRemove(group, value)}
          className="rounded-full border border-brand-500/50 bg-brand-500/10 px-3 py-1 text-xs text-brand-300"
        >
          {value} x
        </button>
      ))}
    </div>
  );
}

export default ActiveFilters;

