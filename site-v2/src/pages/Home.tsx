import { useEffect, useState } from "react";
import EmblemStrip from "../components/EmblemStrip";
import EducationCard from "../components/EducationCard";
import RoleCard from "../components/RoleCard";
import VisitorCounter from "../components/VisitorCounter";
import ChatPanel from "../components/chat/ChatPanel";
import roles from "../data/roles.json";
import educationData from "../data/education.json";
import { profile } from "../data/profile";
import type { Role } from "../types/roles";
import type { Education } from "../types/education";

const roleData = roles as Role[];
const educationList = educationData as Education[];

// Anchor links that appear in the sidebar nav. Add a new entry here when a
// section is added to the page — no layout changes required beyond an id on
// the <section>.
const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#chat", label: "Ask about my experience" },
];

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

const CONTACTS = [
  { label: "LinkedIn", href: profile.contacts.linkedin, icon: <LinkedInIcon />, external: true },
  { label: "Email", href: `mailto:${profile.contacts.email}`, icon: <MailIcon />, external: false },
  { label: "Resume (PDF)", href: profile.contacts.resumePdf, icon: <DownloadIcon />, external: false },
];

function Home() {
  const { name, headline, subhead, summary, location, currentRole } = profile;

  // Which section is currently in view → highlights matching sidebar link.
  const [activeSection, setActiveSection] = useState("experience");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sections = document.querySelectorAll<HTMLElement>("#education, #experience, #chat");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id);
            return;
          }
        }
      },
      // Bias detection toward when the top of a section has scrolled past so
      // we don't flip to "chat" while only its heading is peeking in.
      { root: null, threshold: [0.2, 0.4, 0.6], rootMargin: "-120px 0px -40% 0px" },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Which RoleCards have entered the viewport → trigger staggered reveal.
  const [observedCards, setObservedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = document.getElementById("experience");
    if (!container) return;

    const cards: HTMLElement[] = Array.from(container.querySelectorAll("[data-role-card]"));
    if (!cards.length) return;

    let fired = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const key = el.dataset.roleCard;
          if (!key || observedCards.has(key)) continue; // avoid double-fire

          setObservedCards((prev) => {
            const next = new Set(prev);
            next.add(key);
            return next;
          });
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );

    cards.forEach((card) => observer.observe(card));

    // Safety net: if some cards never enter viewport (e.g. user scrolls past),
    // disconnect after a generous window so we don't leak listeners forever.
    if (!fired) {
      fired = true;
      const timeoutId = setTimeout(() => observer.disconnect(), 30_000);
      return () => clearTimeout(timeoutId);
    }
    return () => observer.disconnect();
  }, [observedCards]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Two-column layout */}
      <div className="mx-auto grid max-w-[96rem] grid-cols-1 lg:grid-cols-[280px_1fr] gap-0">

        {/* ---- Sticky profile sidebar (hidden on mobile, visible on lg+) ---- */}
        <aside className="relative hidden lg:flex lg:flex-col lg:w-[320px] xl:w-[360px] bg-gradient-to-b from-slate-900 via-brand-950 to-slate-900 text-white">
          {/* Ambient glow at top */}
          <div className="absolute inset-x-0 -top-32 h-80 bg-brand-500/10 blur-[100px]" aria-hidden="true" />

          <div className="relative z-10 flex flex-col px-8 py-14 gap-6">
            {/* Name + headline */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">{location}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight leading-[1.1]">{name}</h1>
              <p className="mt-2 text-sm font-semibold text-brand-300">{headline}</p>
            </div>

            {/* Subhead */}
            <p className="text-sm leading-relaxed text-slate-400">{subhead}</p>

            {/* Summary */}
            <p className="text-sm leading-6 text-slate-300/90">{summary}</p>

            {/* Current role badge */}
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <span className="text-xs font-medium leading-snug text-slate-200">
                Currently {currentRole.title} at {currentRole.company}
              </span>
            </div>

            {/* Divider */}
            <hr className="border-white/10" />

            {/* Contact links */}
            <nav aria-label="Contact links" className="flex flex-col gap-2">
              {CONTACTS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {c.icon}
                  <span>{c.label}</span>
                </a>
              ))}
            </nav>

            {/* Section navigation */}
            <nav aria-label="Section links" className="flex flex-col gap-1 border-t border-white/10 pt-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    activeSection === link.href.slice(1)
                      ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" aria-hidden="true" />
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Spacer — pushes chat section toward the bottom of the sidebar on scroll */}
            <div className="mt-auto flex flex-col gap-4 border-t border-white/10 pt-6">
              <VisitorCounter />
            </div>
          </div>
        </aside>

        {/* ---- Main content area ---- */}
        <main className="min-w-0 px-5 py-12 sm:px-8 lg:py-14 xl:pl-8">

          {/* Mobile header (visible only on small screens) */}
          <header className="lg:hidden mb-10">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">{location}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{name}</h1>
            <p className="mt-2 text-lg font-semibold text-brand-700">{headline}</p>
            <p className="mt-1 text-sm text-slate-500">{subhead}</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{summary}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              Currently {currentRole.title} at {currentRole.company}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {CONTACTS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 hover:shadow"
                >
                  {c.icon}
                  <span>{c.label}</span>
                </a>
              ))}
            </div>
          </header>

          {/* Emblem strip — above Experience & Education timeline, desktop only (MobileHeader is lg:hidden) */}
          <div className="mb-10 flex justify-center">
            <EmblemStrip />
          </div>

          {/* Experience section */}
          <section id="experience" className="reveal-on-scroll">
            <h2 className="mb-8 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Experience</h2>
            {roleData.map((role, idx) => (
              <RoleCard
                key={role.id}
                role={role}
                isCurrent={role.end === "Present"}
                observed={observedCards.has(role.id)}
                index={idx}
              />
            ))}
          </section>

          {/* Education section */}
          {educationList.length > 0 && (
            <section id="education" className="reveal-on-scroll">
              <h2 className="mb-8 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Education</h2>
              {educationList.map((edu, idx) => (
                <EducationCard key={edu.id} education={edu} index={idx} />
              ))}
            </section>
          )}

          {/* AI assistant section */}
          <section id="chat" className="reveal-on-scroll mt-14">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/60 p-8 shadow-lg backdrop-blur-xl">
              {/* Subtle background accent */}
              <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-brand-100 blur-3xl" aria-hidden="true" />

              <h2 className="relative text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Ask about my experience
              </h2>
              <p className="mt-2 mb-6 max-w-xl text-sm leading-relaxed text-slate-500 relative">
                A retrieval-grounded assistant that answers recruiter-style questions using only the content on this
                site — and cites the roles it draws from.
              </p>
              <ChatPanel />
            </div>
          </section>

          {/* Footer */}
          <footer className="reveal-on-scroll mt-20 flex flex-col gap-4 border-t border-slate-100 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:hidden">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {CONTACTS.map((c) => (
                <a key={c.label} href={c.href} target={c.external ? "_blank" : undefined} rel={c.external ? "noopener noreferrer" : undefined} className="font-medium text-brand-600 hover:text-brand-700">
                  {c.label}
                </a>
              ))}
            </div>
            <VisitorCounter />
          </footer>

        </main>
      </div>
    </div>
  );
}

export default Home;
