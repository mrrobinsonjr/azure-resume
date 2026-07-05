import { useEffect, useState } from "react";

function getApiBase(): string {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:7071/api";
  }
  return "/api";
}

const SESSION_KEY = "counter_incremented";

// Displays the total visitor count, incrementing once per browser session
// (mirrors the v1 frontend behavior against the same /api/counter backend).
function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const apiBase = getApiBase();

    async function run() {
      try {
        const res = await fetch(`${apiBase}/counter`, { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (typeof data.count !== "number") throw new Error("invalid payload");
        if (active) setCount(data.count);

        if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;

        const inc = await fetch(`${apiBase}/counter/increment`, { method: "POST" });
        if (!inc.ok) throw new Error(`status ${inc.status}`);
        const incData = await inc.json();
        if (typeof incData.count === "number") {
          if (active) setCount(incData.count);
          window.sessionStorage.setItem(SESSION_KEY, "1");
        }
      } catch (error) {
        // Non-fatal. If the initial GET already set a count, keep showing it —
        // a failed/rate-limited increment should not blank out the displayed total.
        console.error("counter fetch failed:", error instanceof Error ? error.message : error);
      }
    }

    void run();
    return () => {
      active = false;
    };
  }, []);

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      {count.toLocaleString()} visitors
    </span>
  );
}

export default VisitorCounter;
