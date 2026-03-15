import type { SortKey } from "../types/roles";

type SortSelectProps = {
  value: SortKey;
  onChange: (value: SortKey) => void;
};

function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300">
      <span>Sort</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-brand-500"
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

