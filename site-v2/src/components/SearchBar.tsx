import { useEffect, useState } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

function SearchBar({ value, onChange }: SearchBarProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const handle = window.setTimeout(() => onChange(draft), 200);
    return () => window.clearTimeout(handle);
  }, [draft, onChange]);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">Search roles</span>
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search company, title, highlights, tech, or body text"
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-brand-500"
      />
    </label>
  );
}

export default SearchBar;

