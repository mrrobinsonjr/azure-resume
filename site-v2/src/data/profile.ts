// Central profile + contact configuration for the resume site.
// Edit these values to update the hero, contact actions, and footer.

export type ContactLink = {
  label: string;
  href: string;
  // Rendered as the visible text; falls back to label when omitted.
  display?: string;
};

export const profile = {
  name: "Michael Robinson",
  headline: "",
  subhead: "Cloud Architecture · Cybersecurity · DevSecOps — 20+ years across DoD & enterprise",
  summary:
    "Cloud architect and cybersecurity leader with 20+ years across DoD and enterprise environments. I design secure cloud platforms, build DevSecOps pipelines, and lead modernization efforts for mission-critical systems in regulated IL4/IL5/IL6 contexts.",
  pictureUrl: "/profile-pictures/1687255499296.jpeg",
  location: "Remote · United States",
  currentRole: {
    title: "Azure Architecture and Engineering Manager",
    company: "Leidos — USAF Cloud One ACSS",
  },
  // NOTE: confirm the LinkedIn URL before publishing.
  contacts: {
    linkedin: "https://www.linkedin.com/in/mrrobinsonjr/",
    email: "michaelrobinsonjr@gmail.com",
    resumePdf: "/downloads/resume.pdf",
    resumeDocx: "/downloads/resume.docx",
  },
} as const;
