import RoleCard from "../components/RoleCard";
import VisitorCounter from "../components/VisitorCounter";
import ChatPanel from "../components/chat/ChatPanel";
import roles from "../data/roles.json";
import { profile } from "../data/profile";
import type { Role } from "../types/roles";

const roleData = roles as Role[];

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function Home() {
  const { name, headline, subhead, summary, location, currentRole, contacts } = profile;

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <main className="mx-auto w-full max-w-3xl px-6 py-14 sm:py-20">
        {/* Hero */}
        <header className="border-b border-slate-100 pb-10">
          <p className="text-sm font-medium text-slate-500">{location}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{name}</h1>
          <p className="mt-2 text-lg font-semibold text-brand-700">{headline}</p>
          <p className="mt-1 text-sm text-slate-500">{subhead}</p>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">{summary}</p>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Currently {currentRole.title} at {currentRole.company}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={contacts.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <LinkedInIcon /> LinkedIn
            </a>
            <a
              href={`mailto:${contacts.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <MailIcon /> Email
            </a>
            <a
              href={contacts.resumePdf}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <DownloadIcon /> Résumé
            </a>
          </div>
        </header>

        {/* Experience */}
        <section className="pt-10">
          <h2 className="mb-8 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Experience</h2>
          <div>
            {roleData.map((role) => (
              <RoleCard key={role.id} role={role} isCurrent={role.end === "Present"} />
            ))}
          </div>
        </section>

        {/* AI assistant — secondary feature */}
        <section className="border-t border-slate-100 pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Ask about my experience</h2>
          <p className="mt-2 mb-5 max-w-2xl text-sm text-slate-500">
            A retrieval-grounded assistant that answers recruiter-style questions using only the content on this
            site — and cites the roles it draws from.
          </p>
          <ChatPanel />
        </section>

        {/* Footer */}
        <footer className="mt-14 flex flex-col gap-4 border-t border-slate-100 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={contacts.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:text-brand-700">
              LinkedIn
            </a>
            <a href={`mailto:${contacts.email}`} className="font-medium text-brand-600 hover:text-brand-700">
              Email
            </a>
            <a href={contacts.resumePdf} className="font-medium text-brand-600 hover:text-brand-700">
              Résumé (PDF)
            </a>
            <a href={contacts.resumeDocx} className="font-medium text-brand-600 hover:text-brand-700">
              DOCX
            </a>
          </div>
          <VisitorCounter />
        </footer>
      </main>
    </div>
  );
}

export default Home;
