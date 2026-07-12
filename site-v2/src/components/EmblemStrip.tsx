import React from "react";

type Emblem = {
  label: string;
  alt: string;
  svgPath: React.ReactNode;
};

// Placeholder SVG paths for the six emblems. Each is a simplified silhouette on a
// 24x24 viewBox — designed to be recognizable at small sizes (28px tall). Swap the
// `svgPath` value with an official asset later without touching the layout code.
const EMBLEMS: Emblem[] = [
  {
    label: "USMC",
    alt: "United States Marine Corps Eagle-Globe-Anchor",
    svgPath: (
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Globe */}
        <circle cx="12" cy="14" r="5.5" />
        <path d="M8 14h8M12 9v9" strokeDasharray="1 2" strokeWidth="0.8" />
        {/* Eagle silhouette (simplified) */}
        <path d="M6 7c1-3 3-4 6-4s5 1 6 4" fill="currentColor" stroke="none" opacity="0.9" />
        <path d="M8 8l2-2h4l2 2" fill="none" stroke="currentColor" strokeWidth="1" />
        {/* Anchor */}
        <path d="M8 18v3m8-3v3M7 19.5c0 1 1.5 2 5 2s5-1 5-2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </g>
    ),
  },
  {
    label: "USAF",
    alt: "United States Air Force roundel",
    svgPath: (
      <g>
        {/* Outer ring */}
        <circle cx="12" cy="12" r="10" fill="#1e3a5f" stroke="#fff" strokeWidth="1.5" />
        {/* White star in center */}
        <polygon
          points="12,6 13.2,9.5 17,9.5 14,12 15.2,16 12,13.5 8.8,16 10,12 7,9.5 10.8,9.5"
          fill="#fff"
        />
        {/* Horizontal bars */}
        <rect x="4" y="11" width="16" height="2" rx="0.5" fill="#f4c430" opacity="0.9" />
      </g>
    ),
  },
  {
    label: "MTSU",
    alt: "Middle Tennessee State University Blue Raider",
    svgPath: (
      <g>
        {/* Block M — Blue Raider inspired */}
        <path
          d="M4 6h3.5l3.5 8 3.5-8H19v12h-3V10l-3.5 9h-2L7 10v8H4V6z"
          fill="#003366"
        />
      </g>
    ),
  },
  {
    label: "USAFCENT",
    alt: "U.S. Air Forces Central Command",
    svgPath: (
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Shield outline */}
        <path d="M4 5h16v9c0 4-8 8-8 8s-8-4-8-8V5z" fill="#1e3a5f" stroke-width="1.5" />
        {/* Crescent */}
        <path d="M10 7a5 5 0 1 0 5 6" fill="#fff" opacity="0.9" stroke="none" />
        {/* Stars inside shield */}
        <polygon points="12,10 12.8,12 15,12.3 13.4,14 14,16 12,15 10,16 10.6,14 9,12.3 11.2,12" fill="#f4c430" stroke="none" />
      </g>
    ),
  },
  {
    label: "USCENTCOM",
    alt: "U.S. Central Command emblem",
    svgPath: (
      <g>
        {/* Shield shape */}
        <path d="M3 4h18l-2 16c0 0-4 4-7 4s-7-4-7-4L3 4z" fill="#0f2b46" stroke="#fff" strokeWidth="1.5" />
        {/* Chevron / stripes */}
        <path d="M8 10l4-3 4 3M8 14l4-3 4 3" stroke="#f4c430" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Star at top */}
        <polygon points="12,5.5 13.2,8.5 16.5,8.5 13.8,10.5 14.8,14 12,12 9.2,14 10.2,10.5 7.5,8.5 10.8,8.5" fill="#fff" stroke="none" />
      </g>
    ),
  },
  {
    label: "Cloud One",
    alt: "DoD Cloud One Program",
    svgPath: (
      <g>
        {/* Cloud shape — abstract DoD Cloud branding style */}
        <path
          d="M6 15a4 4 0 0 1-.8-7.9A6 6 0 0 1 17.5 7 5 5 0 0 1 18 15H6z"
          fill="#2563eb"
          stroke="#fff"
          strokeWidth="0.8"
        />
        {/* Small cloud detail */}
        <circle cx="9" cy="11" r="1.5" fill="#fff" opacity="0.4" />
      </g>
    ),
  },
];

function EmblemStrip({ emblems = EMBLEMS }: { emblems?: Emblem[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      {emblems.map((emblem) => (
        <figure key={emblem.label} className="flex flex-col items-center gap-1.5" title={emblem.alt}>
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-auto opacity-85 transition-opacity hover:opacity-100"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {emblem.svgPath}
          </svg>
          <figcaption className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {emblem.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default EmblemStrip;
