import { useState } from "react";
import Chips from "./Chips";
import type { Role } from "../types/roles";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(value: string): string {
  if (!value || value === "Present") return "Present";
  const [year, month] = value.split("-");
  const idx = Number(month) - 1;
  return MONTHS[idx] ? `${MONTHS[idx]} ${year}` : year;
}

type RoleCardProps = {
  role: Role;
  isCurrent?: boolean;
};

function RoleCard({ role, isCurrent = false }: RoleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const period = `${formatDate(role.start)} – ${formatDate(role.end)}`;

  return (
    <article className="relative pl-8">
      {/* Timeline rail + node */}
      <span
        className="absolute left-0 top-1.5 h-full w-px bg-slate-200"
        aria-hidden="true"
      />
      <span
        className={`absolute left-[-4px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
          isCurrent ? "bg-brand-500" : "bg-slate-300"
        }`}
        aria-hidden="true"
      />

      <div className="pb-9">
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h3 className="text-base font-semibold text-slate-900">{role.title}</h3>
            <span className="text-sm font-medium text-slate-500">{period}</span>
          </div>
          <p className="text-sm font-medium text-brand-700">{role.company}</p>
          <p className="text-sm text-slate-500">{role.location}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Chips items={role.clearance ? [role.clearance] : []} tone="accent" />
          <Chips items={role.il_levels} tone="accent" />
          <Chips items={role.tech.slice(0, 6)} tone="neutral" />
        </div>

        {role.highlights.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 marker:text-slate-300">
            {role.highlights.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          aria-expanded={expanded}
        >
          {expanded ? "Hide details" : "Show details"}
        </button>

        {expanded && (
          <div
            className="prose-scope mt-3 border-t border-slate-100 pt-3 text-sm"
            dangerouslySetInnerHTML={{ __html: role.bodyHtml }}
          />
        )}
      </div>
    </article>
  );
}

export default RoleCard;
