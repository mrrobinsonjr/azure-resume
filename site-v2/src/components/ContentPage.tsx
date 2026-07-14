interface Props {
  title: string;
  description?: string;
  contentHtml: string;
}

// Styles for the rendered markdown content — matches the site's slate palette
// without requiring @tailwindcss/typography (not installed).
const MARKDOWN_STYLES = `
  .arch-content h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
  }
  .arch-content p {
    line-height: 1.7;
    margin-bottom: 1rem;
    color: #334155;
  }
  .arch-content ul, .arch-content ol {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  .arch-content li {
    margin-bottom: 0.25rem;
  }
  .arch-content strong {
    font-weight: 600;
    color: #0f172a;
  }
`;

export default function ContentPage({ title, description, contentHtml }: Props) {
  return (
    <section id="architecture" className="reveal-on-scroll">
      <style>{MARKDOWN_STYLES}</style>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/60 p-8 shadow-lg backdrop-blur-xl">
        {/* Subtle background accent */}
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-brand-100 blur-3xl" aria-hidden="true" />

        <h2 className="relative text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
          {title}
        </h2>
        {description && (
          <p className="mt-2 mb-6 max-w-xl text-sm leading-relaxed text-slate-500 relative">
            {description}
          </p>
        )}

        {/* Rendered markdown content */}
        <div className="relative arch-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
    </section>
  );
}
