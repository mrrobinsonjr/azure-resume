function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
        <header className="mb-10 border-b border-slate-800 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Resume Site v2</p>
          <h1 className="mt-2 text-4xl font-bold">Your Name</h1>
          <p className="mt-2 text-slate-300">Cloud Engineer · Platform Reliability · Automation</p>
        </header>

        <section className="mb-10 rounded-xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold">Roles</h2>
          <div className="mt-4 rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-6 text-slate-400">
            Roles content will be added in a later ticket.
          </div>
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
