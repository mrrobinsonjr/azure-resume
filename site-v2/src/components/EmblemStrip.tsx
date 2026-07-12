/**
 * Configuration for each emblem displayed in the strip.
 *
 * `src` is a relative path under site-v2/public — Vite serves that folder as-is, so an SVG
 * dropped into public/emblems/usmc.svg renders at /emblems/usmc.svg.
 *
 * Drop your own official SVGs there; update this list to match the filenames you add or remove.
 */
type Emblem = {
  label: string;
  alt: string;
  /** Path relative to site-v2/public (e.g., "emblems/usmc.svg"). */
  src: string;
};

const EMBLEMS: Emblem[] = [
  { label: "USMC",     alt: "United States Marine Corps Eagle-Globe-Anchor",    src: "emblems/Emblem_of_the_United_States_Marine_Corps.svg" },
  { label: "USAF",     alt: "United States Air Force service mark",              src: "emblems/250px-U.S._Air_Force_service_mark.svg.webp" },
  { label: "MTSU",     alt: "Middle Tennessee State University Blue Raider",      src: "emblems/Middle_Tennessee_MT_Logomark.svg" },
  { label: "USAFCENT", alt: "U.S. Air Forces Central Command emblem",            src: "emblems/250px-United_States_Air_Forces_Central_Command_-_Emblem.png" },
  { label: "USCENTCOM",alt: "U.S. Central Command seal",                         src: "emblems/250px-Seal_of_United_States_Central_Command.svg.webp" },
  { label: "Cloud One",alt: "DoD Cloud One Program logo",                        src: "emblems/c1-logo-tagline-multi-dark-hd.2ebae3ae34bf536790a1.png" },
];

function EmblemStrip({ emblems = EMBLEMS }: { emblems?: Emblem[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      {emblems.map((emblem) => (
        <figure key={emblem.label} className="flex flex-col items-center gap-1.5" title={emblem.alt}>
          <img
            src={`/${emblem.src}`}
            alt={emblem.alt}
            className="h-7 w-auto opacity-85 transition-opacity hover:opacity-100"
            loading="lazy"
          />
          <figcaption className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {emblem.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default EmblemStrip;
