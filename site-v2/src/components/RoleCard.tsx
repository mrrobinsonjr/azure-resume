import { useState } from "react";
import Chips from "./Chips";

export type Role = {
  id: string;
  company: string;
  title: string;
  location: string;
  start: string;
  end: string;
  clearance: string;
  il_levels: string[];
  tags: string[];
  tech: string[];
  highlights: string[];
  bodyHtml: string;
};

type RoleCardProps = {
  role: Role;
};

function RoleCard({ role }: RoleCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <header>
        <p className="text-xs uppercase tracking-wide text-slate-400">{role.company}</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-100">{role.title}</h3>
        <p className="mt-1 text-sm text-slate-300">{role.location}</p>
        <p className="text-sm text-slate-400">{role.start} - {role.end}</p>
      </header>

      <div className="mt-4 space-y-2">
        <Chips label="IL" items={role.il_levels} />
        <Chips label="Tags" items={role.tags} />
        <Chips label="Tech" items={role.tech} />
        <Chips label="Clearance" items={role.clearance ? [role.clearance] : []} />
      </div>

      {role.highlights.length > 0 && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-200">
          {role.highlights.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-4 text-sm font-semibold text-brand-500 hover:text-brand-600"
      >
        {expanded ? "Hide details" : "Show details"}
      </button>

      {expanded && (
        <div
          className="prose-scope mt-4 border-t border-slate-800 pt-4 text-sm text-slate-200"
          dangerouslySetInnerHTML={{ __html: role.bodyHtml }}
        />
      )}
    </article>
  );
}

export default RoleCard;
