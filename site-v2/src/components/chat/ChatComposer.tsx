import { useState, type FormEvent } from "react";

type ChatComposerProps = {
  disabled?: boolean;
  onSend: (value: string) => Promise<void> | void;
};

function ChatComposer({ disabled = false, onSend }: ChatComposerProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = value.trim();
    if (!next || disabled) return;
    setValue("");
    await onSend(next);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        rows={3}
        placeholder="Ask a recruiter-style question about cloud architecture, IL5/IL6, Terraform, or leadership experience."
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Thinking..." : "Send"}
        </button>
      </div>
    </form>
  );
}

export default ChatComposer;
