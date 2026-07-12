import type { Education } from "../types/education";

type EducationCardProps = {
  education: Education;
  index?: number;
};

function EducationCard({ education, index = 0 }: EducationCardProps) {
  const gradText = [education.degree.level, education.degree.field].filter(Boolean).join(" · ");
  const minorText = education.minor ? `Minor: ${education.minor}` : null;

  return (
    <article className="group flex gap-x-4 pl-8" data-role-card={education.id}>
      {/* Timeline column — dot sits at top, rail extends below via flex-grow */}
      <div className="flex shrink-0 flex-col items-center pt-[6px] w-[18px] gap-4">
        {/* Node dot — book icon instead of role dot */}
        <span className="relative z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white ring-4 ring-slate-200 group-hover:ring-brand-200">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-600" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M2 3h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
            <path d="M22 3h-9a2 2 0 0 1-2 2v14a2 2 0 0 1 2 2h7a2 2 0 0 1 2-2V5a2 2 0 0 1-2-2Z" />
          </svg>
        </span>

        {/* Rail — fills remaining height to match card body */}
        <span className="grow w-[3px] rounded-full bg-slate-200 transition-colors group-hover:bg-brand-300/60" aria-hidden="true" />
      </div>

      {/* Card body */}
      <div className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:border-brand-200/70">
        {/* School */}
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{education.school}</p>

        {/* Degree title */}
        <h3 className={`mt-1 text-base font-semibold tracking-tight ${minorText ? "text-brand-700" : "text-slate-900"} transition-colors`}>
          {gradText}
        </h3>

        {/* Minor */}
        {minorText && (
          <p className="mt-0.5 text-sm text-slate-600">{minorText}</p>
        )}

        {/* Location */}
        <p className="mt-1 text-xs text-slate-500">{education.location}</p>

        {/* Honors (if any) */}
        {education.honors && education.honors.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 marker:text-brand-300">
            {education.honors.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}

        {/* Date range if provided later */}
        {(education.start || education.end) && (
          <time className="mt-2 block text-xs font-medium tabular-nums text-slate-500">
            {[education.start, education.end].filter(Boolean).join(" – ")}
          </time>
        )}
      </div>
    </article>
  );
}

export default EducationCard;
