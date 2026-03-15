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
  mock?: boolean;
};

const STARTER_PROMPTS = [
  "What Azure Government experience does Michael have?",
  "What roles involved IL5 or IL6 environments?",
  "What is his background in Terraform and automation?",
  "Which roles are most relevant to cloud architecture leadership?",
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

  const canShowPrompts = useMemo(() => messages.length <= 1, [messages.length]);

  async function sendQuestion(question: string) {
    const userMessage: Message = { id: createId(), role: "user", content: question };
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
        mock: payload.mode === "mock",
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unexpected error";
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: `I couldn't complete that chat request: ${detail}`,
        },
      ]);
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
          Phase 3A foundation: chat is grounded to local resume content now, with fuller retrieval coming next.
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

      <div className="mt-6 flex max-h-[28rem] flex-col gap-4 overflow-y-auto pr-1">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            citations={message.citations}
            mock={message.mock}
          />
        ))}
      </div>

      <ChatComposer disabled={loading} onSend={sendQuestion} />
    </section>
  );
}

export default ChatPanel;
