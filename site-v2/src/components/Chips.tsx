type ChipTone = "accent" | "neutral";

type ChipsProps = {
  items: string[];
  label?: string;
  tone?: ChipTone;
};

const toneClass: Record<ChipTone, string> = {
  accent: "border-brand-100 bg-brand-50 text-brand-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
};

function Chips({ items, label, tone = "neutral" }: ChipsProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {label && (
        <span className="mr-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      )}
      {items.map((item) => (
        <span
          key={`${label ?? "chip"}-${item}`}
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClass[tone]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default Chips;
