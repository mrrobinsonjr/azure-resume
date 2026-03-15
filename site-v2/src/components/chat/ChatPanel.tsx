import { useMemo, useState } from "react";
import ChatComposer from "./ChatComposer";
import ChatMessage from "./ChatMessage";

type Citation = {
  id: string;
  title: string;
  section: string;
};

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  citations?: Citation[];
  mode?: "mock" | "fallback" | "azure_openai_rag";
};

const STARTER_PROMPTS = [
  "What Azure Government experience does Michael have?",
  "Which roles best match a cloud architect position?",
  "What experience does he have with Terraform, Azure Policy, and automation?",
  "What leadership and mentoring experience is reflected in these roles?",
  "Which roles involved IL5 or IL6 environments?",
];

function getApiBase(): string {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:7071/api";
  }
  return "/api";
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Ask recruiter-style questions about Michael Robinson's resume. I'll answer only from the site context and cite the most relevant sections.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryQuestion, setRetryQuestion] = useState("");

  const canShowPrompts = useMemo(() => messages.length <= 1, [messages.length]);

  async function sendQuestion(question: string): Promise<boolean> {
    const userMessage: Message = { id: createId(), role: "user", content: question };
    setDraft(question);
    setErrorMessage("");
    setRetryQuestion("");
    setMessages((current) => [...current, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(`${getApiBase()}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Chat request failed");
      }

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: payload.answer,
        citations: payload.citations,
        mode: payload.mode,
      };
      setMessages((current) => [...current, assistantMessage]);
      setDraft("");
      return true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unexpected error";
      setErrorMessage(`The recruiter chat hit a temporary issue: ${detail}`);
      setRetryQuestion(question);
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-10 rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Recruiter Chat</p>
        <h2 className="text-2xl font-semibold">Ask about role fit, cloud depth, or mission context</h2>
        <p className="text-sm text-slate-300">
          Answers are based only on resume-site content and cite the most relevant supporting sections.
        </p>
      </div>

      {canShowPrompts && (
        <div className="mt-4 flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendQuestion(prompt)}
              disabled={loading}
              className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 transition hover:border-brand-500 hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {messages.length === 1 && !loading && (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
          Start with a recruiter-style question about architecture leadership, IL5/IL6, automation, or mission fit.
        </div>
      )}

      <div className="mt-6 flex max-h-[28rem] flex-col gap-4 overflow-y-auto pr-1">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            citations={message.citations}
            mode={message.mode}
          />
        ))}
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          <p>{errorMessage}</p>
          {retryQuestion && (
            <button
              type="button"
              onClick={() => void sendQuestion(retryQuestion)}
              className="mt-3 rounded-full border border-amber-300/50 px-3 py-1 text-xs font-semibold text-amber-100 hover:bg-amber-300/10"
            >
              Retry last question
            </button>
          )}
        </div>
      )}

      <ChatComposer disabled={loading} initialValue={draft} onSend={sendQuestion} />
    </section>
  );
}

export default ChatPanel;
