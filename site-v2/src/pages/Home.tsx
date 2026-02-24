import RolesGrid from "../components/RolesGrid";
import roles from "../data/roles.json";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <header className="mb-10 border-b border-slate-800 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Resume Site v2</p>
          <h1 className="mt-2 text-4xl font-bold">Robin Robinson</h1>
          <p className="mt-2 text-slate-300">Cloud Architect · Cybersecurity Engineer · DevSecOps</p>
        </header>

        <section className="mb-10 rounded-xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold">Roles</h2>
          <p className="mt-2 text-slate-300">Selected experience with detailed impact, technologies, and mission context.</p>
          <RolesGrid roles={roles} />
        </section>

        <footer className="mt-auto border-t border-slate-800 pt-6 text-sm text-slate-300">
          <p className="mb-2 font-medium">Downloads</p>
          <div className="flex gap-4">
            <a className="text-brand-500 hover:text-brand-600" href="/downloads/resume.pdf">
              Resume (PDF)
            </a>
            <a className="text-brand-500 hover:text-brand-600" href="/downloads/resume.docx">
              Resume (DOCX)
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Home;
