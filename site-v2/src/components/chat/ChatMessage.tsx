type Citation = {
  id: string;
  title: string;
  section: string;
};

type ChatMessageProps = {
  role: "assistant" | "user";
  content: string;
  citations?: Citation[];
  mode?: "mock" | "fallback" | "azure_openai_rag";
};

const MODE_BADGES: Record<string, { label: string; className: string }> = {
  mock: { label: "Mock", className: "border-amber-200 bg-white/80 text-amber-600" },
  fallback: { label: "Fallback", className: "border-amber-200 bg-white/80 text-amber-600" },
  azure_openai_rag: { label: "Grounded", className: "border-emerald-200 bg-emerald-50/80 text-emerald-700" },
};

function ChatMessage({ role, content, citations = [], mode = "azure_openai_rag" }: ChatMessageProps) {
  const isAssistant = role === "assistant";
  const badge = MODE_BADGES[mode] ?? MODE_BADGES.azure_openai_rag;

  return (
    <div className={`flex animate-fade-in ${isAssistant ? "justify-start" : "justify-end"} pr-6`}>
      <div className="w-full max-w-[85%] sm:max-w-[75%]">
        {/* Label + mode badge */}
        <div className={`mb-1.5 flex items-center gap-2 text-xs ${isAssistant ? "text-slate-400" : "justify-end text-slate-400"}`}>
          <span>{isAssistant ? "Assistant" : "You"}</span>
          {isAssistant && (
            <span className={`rounded-full border px-2 py-0.5 font-medium ${badge.className}`}>{badge.label}</span>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={
            isAssistant
              ? "rounded-2xl rounded-tl-sm border border-slate-200/80 bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-700 shadow-sm"
              : "rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-3 text-[15px] font-medium leading-relaxed text-white shadow-md shadow-brand-600/20"
          }
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>

        {/* Mode warnings */}
        {isAssistant && mode === "mock" && (
          <p className="mt-1.5 text-xs italic text-amber-600/80">Mock response — Azure OpenAI not configured.</p>
        )}
        {isAssistant && mode === "fallback" && (
          <p className="mt-1.5 text-xs italic text-amber-600/80">Fallback response — retrieval unavailable for this request.</p>
        )}

        {/* Citations */}
        {isAssistant && citations.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {citations.map((citation) => (
              <span
                key={`${citation.id}-${citation.section}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/70 px-2 py-1 text-[11px] font-medium text-slate-500 shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                {citation.title} — {citation.section}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
