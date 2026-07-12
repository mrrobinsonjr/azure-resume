type ChipTone = "accent" | "neutral";

type ChipsProps = {
  items: string[];
  label?: string;
  tone?: ChipTone;
};

const toneClass: Record<ChipTone, string> = {
  accent: "border-brand-200 bg-brand-50 text-brand-700",
  neutral: "border-slate-200/80 bg-white/60 text-slate-600 backdrop-blur-sm",
};

function Chips({ items, label, tone = "neutral" }: ChipsProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {label && (
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      )}
      {items.map((item) => (
        <span
          key={`${label ?? "chip"}-${item}`}
          className={`rounded-full border px-2.5 py-0.5 text-[12px] font-medium transition-colors ${toneClass[tone]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default Chips;
