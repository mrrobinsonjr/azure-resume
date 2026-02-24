type ChipsProps = {
  items: string[];
  label: string;
};

function Chips({ items, label }: ChipsProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      {items.map((item) => (
        <span key={`${label}-${item}`} className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200">
          {item}
        </span>
      ))}
    </div>
  );
}

export default Chips;
