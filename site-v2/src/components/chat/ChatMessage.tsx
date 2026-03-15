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

function ChatMessage({ role, content, citations = [], mode = "azure_openai_rag" }: ChatMessageProps) {
  const isAssistant = role === "assistant";
  const badge =
    mode === "mock"
      ? "Mock"
      : mode === "fallback"
        ? "Fallback"
        : "Grounded";
  const badgeClass =
    mode === "mock" || mode === "fallback"
      ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
      : "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";

  return (
    <div className={isAssistant ? "self-start" : "self-end"}>
      <div className={`mb-2 flex items-center gap-2 text-xs ${isAssistant ? "text-slate-400" : "justify-end text-brand-200"}`}>
        <span>{isAssistant ? "Recruiter Assistant" : "You"}</span>
        {isAssistant && <span className={`rounded-full border px-2 py-0.5 ${badgeClass}`}>{badge}</span>}
      </div>
      <div
        className={
          isAssistant
            ? "max-w-2xl rounded-3xl rounded-tl-sm border border-slate-700 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-100 shadow-sm"
            : "max-w-2xl rounded-3xl rounded-tr-sm bg-brand-500 px-4 py-3 text-sm leading-6 text-slate-950 shadow-sm"
        }
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>

      {isAssistant && mode === "mock" && (
        <p className="mt-2 text-xs text-amber-300">Mock response: Azure OpenAI env vars are not configured.</p>
      )}

      {isAssistant && mode === "fallback" && (
        <p className="mt-2 text-xs text-amber-300">Fallback response: embeddings retrieval was unavailable for this request.</p>
      )}

      {isAssistant && citations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {citations.map((citation) => (
            <span
              key={`${citation.id}-${citation.section}`}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300"
            >
              {citation.title} {"\u2014"} {citation.section}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
