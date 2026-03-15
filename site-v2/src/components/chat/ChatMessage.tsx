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

  return (
    <div className={isAssistant ? "self-start" : "self-end"}>
      <div
        className={
          isAssistant
            ? "max-w-2xl rounded-2xl rounded-tl-sm border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100"
            : "max-w-2xl rounded-2xl rounded-tr-sm bg-brand-500 px-4 py-3 text-sm text-slate-950"
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
        <div className="mt-2 flex flex-wrap gap-2">
          {citations.map((citation) => (
            <span
              key={`${citation.id}-${citation.section}`}
              className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300"
            >
              {citation.title} · {citation.section}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
