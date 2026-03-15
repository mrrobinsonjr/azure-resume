import { useEffect, useState, type FormEvent } from "react";

type ChatComposerProps = {
  disabled?: boolean;
  initialValue?: string;
  onSend: (value: string) => Promise<boolean> | boolean;
};

function ChatComposer({ disabled = false, initialValue = "", onSend }: ChatComposerProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = value.trim();
    if (!next || disabled) return;
    const sent = await onSend(next);
    if (sent) {
      setValue("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        rows={3}
        placeholder="Ask a recruiter-style question about cloud architecture, IL5/IL6, Terraform, or leadership experience."
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">Answers are based only on resume-site content.</p>
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
