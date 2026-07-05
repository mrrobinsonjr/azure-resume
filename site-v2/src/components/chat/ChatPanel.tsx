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
  "What is Michael's current role?",
  "What Azure Government experience does he have?",
  "Which roles involved IL5 or IL6 environments?",
  "What leadership and mentoring experience does he bring?",
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
        "Ask a question about Michael Robinson's experience. Answers come only from this site's resume content, with citations to the relevant roles.",
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
      setErrorMessage(`The assistant hit a temporary issue: ${detail}`);
      setRetryQuestion(question);
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {canShowPrompts && (
        <div className="flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendQuestion(prompt)}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex max-h-[26rem] flex-col gap-4 overflow-y-auto pr-1">
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
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>{errorMessage}</p>
          {retryQuestion && (
            <button
              type="button"
              onClick={() => void sendQuestion(retryQuestion)}
              className="mt-2.5 rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              Retry last question
            </button>
          )}
        </div>
      )}

      <ChatComposer disabled={loading} initialValue={draft} onSend={sendQuestion} />
    </div>
  );
}

export default ChatPanel;
