import type { SortKey } from "../types/roles";

type SortSelectProps = {
  value: SortKey;
  onChange: (next: SortKey) => void;
};

function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300">
      <span>Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="company_az">Company A-Z</option>
        <option value="title_az">Title A-Z</option>
      </select>
    </label>
  );
}

export default SortSelect;
