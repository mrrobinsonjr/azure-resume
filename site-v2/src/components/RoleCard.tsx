import { useState } from "react";
import Chips from "./Chips";
import type { Role } from "../types/roles";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Milliseconds to delay each card in the cascade (set by Home.tsx via --stagger-delay). */
const STAGGER_DELAY_MS = 80;

function formatDate(value: string): string {
  if (!value || value === "Present") return "Present";
  const [year, month] = value.split("-");
  const idx = Number(month) - 1;
  return MONTHS[idx] ? `${MONTHS[idx]} ${year}` : year;
}

type RoleCardProps = {
  role: Role;
  isCurrent?: boolean;
  observed?: boolean;
  index?: number;
};

function RoleCard({ role, isCurrent = false, observed = false, index = 0 }: RoleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const period = `${formatDate(role.start)} – ${formatDate(role.end)}`;

  return (
    <article
      data-role-card={role.id}
      className={`group flex gap-x-4 pl-8 ${observed ? "role-card-revealed" : ""}`}
      style={observed ? { "--stagger-delay": `${index * STAGGER_DELAY_MS}ms` } as React.CSSProperties : undefined}
    >
      {/* Timeline column — dot at top, rail extends below via flex-grow */}
      <div className="flex shrink-0 flex-col items-center pt-[6px] w-[18px] gap-4">
        {/* Node dot */}
        <span
          className={`relative z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-4 transition-all duration-700 ${
            isCurrent
              ? "bg-brand-500 ring-brand-200/60 shadow-lg shadow-brand-500/30"
              : "bg-slate-300 group-hover:bg-brand-400 ring-white"
          }`}
          aria-hidden="true"
        />

        {/* Rail with gradient for current role */}
        <span
          className={`grow w-[3px] rounded-full transition-all duration-700 ${
            isCurrent
              ? "bg-gradient-to-b from-brand-400 via-brand-500 to-slate-300"
              : "bg-slate-200 group-hover:bg-brand-300/60"
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Card body */}
      <div className={`min-w-0 flex-1 rounded-xl border bg-white p-5 transition-all duration-300 ${
          isCurrent
            ? "border-brand-200/70 shadow-md shadow-brand-100/40"
            : "border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-[1px] hover:border-slate-300"
        }`}>

        {/* Title row */}
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className={`text-base font-semibold tracking-tight ${isCurrent ? "text-brand-700" : "text-slate-900 group-hover:text-brand-800"} transition-colors`}>
            {role.title}
          </h3>
          <time className="text-xs font-medium tabular-nums text-slate-500">{period}</time>
        </div>

        {/* Company + location */}
        <p className={`mt-0.5 text-sm font-semibold ${isCurrent ? "text-brand-600" : "text-brand-700 group-hover:text-brand-800"} transition-colors`}>
          {role.company}
        </p>
        <p className="text-xs text-slate-500">{role.location}</p>

        {/* Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {role.clearance && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              {role.clearance}
            </span>
          )}
          <Chips items={role.il_levels} tone="accent" />
          <Chips items={role.tech.slice(0, 6)} tone="neutral" />
        </div>

        {/* Highlights */}
        {role.highlights.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 marker:text-brand-300">
            {role.highlights.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {/* Expand / collapse toggle */}
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={`mt-3 text-sm font-semibold transition-colors ${
            isCurrent ? "text-brand-600 hover:text-brand-700" : "text-brand-600 group-hover:text-brand-700"
          }`}
          aria-expanded={expanded}
        >
          {expanded ? "Hide details" : "Show details"}
        </button>

        {/* Expanded body with smooth reveal */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className="prose-scope mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: role.bodyHtml }}
          />
        </div>
      </div>
    </article>
  );
}

export default RoleCard;
