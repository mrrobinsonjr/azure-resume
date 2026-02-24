type ActiveFiltersProps = {
  selected: {
    tech: Set<string>;
    tags: Set<string>;
    il: Set<string>;
    clr: Set<string>;
  };
  onRemove: (group: "tech" | "tags" | "il" | "clr", value: string) => void;
};

function ActiveFilters({ selected, onRemove }: ActiveFiltersProps) {
  const chips: Array<{ group: "tech" | "tags" | "il" | "clr"; value: string }> = [];
  (Object.keys(selected) as Array<"tech" | "tags" | "il" | "clr">).forEach((group) => {
    selected[group].forEach((value) => chips.push({ group, value }));
  });

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.group}-${chip.value}`}
          type="button"
          onClick={() => onRemove(chip.group, chip.value)}
          className="rounded-full border border-brand-500 bg-brand-500/20 px-2 py-1 text-xs text-brand-500"
        >
          {chip.value} ×
        </button>
      ))}
    </div>
  );
}

export default ActiveFilters;
