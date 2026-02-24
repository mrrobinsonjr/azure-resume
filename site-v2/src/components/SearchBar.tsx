import { useEffect, useState } from "react";

type SearchBarProps = {
  value: string;
  onChange: (next: string) => void;
};

function SearchBar({ value, onChange }: SearchBarProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => onChange(draft), 200);
    return () => window.clearTimeout(timer);
  }, [draft, onChange]);

  return (
    <label className="block">
      <span className="sr-only">Search roles</span>
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Search company, title, highlights, tech..."
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
      />
    </label>
  );
}

export default SearchBar;
