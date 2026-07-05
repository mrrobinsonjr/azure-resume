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
  const badge = mode === "mock" ? "Mock" : mode === "fallback" ? "Fallback" : "Grounded";
  const badgeClass =
    mode === "mock" || mode === "fallback"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={isAssistant ? "self-start" : "self-end"}>
      <div
        className={`mb-1.5 flex items-center gap-2 text-xs ${
          isAssistant ? "text-slate-400" : "justify-end text-slate-400"
        }`}
      >
        <span>{isAssistant ? "Assistant" : "You"}</span>
        {isAssistant && <span className={`rounded-full border px-2 py-0.5 ${badgeClass}`}>{badge}</span>}
      </div>
      <div
        className={
          isAssistant
            ? "max-w-2xl rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
            : "max-w-2xl rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-3 text-sm leading-6 text-white"
        }
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>

      {isAssistant && mode === "mock" && (
        <p className="mt-2 text-xs text-amber-600">Mock response: Azure OpenAI is not configured in this environment.</p>
      )}

      {isAssistant && mode === "fallback" && (
        <p className="mt-2 text-xs text-amber-600">Fallback response: embeddings retrieval was unavailable for this request.</p>
      )}

      {isAssistant && citations.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {citations.map((citation) => (
            <span
              key={`${citation.id}-${citation.section}`}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500"
            >
              {citation.title} {"—"} {citation.section}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
