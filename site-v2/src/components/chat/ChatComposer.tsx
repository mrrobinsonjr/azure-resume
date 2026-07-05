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
        placeholder="Ask about cloud architecture, IL5/IL6 experience, Terraform, or leadership…"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">Answers draw only from this site's résumé content.</p>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Thinking…" : "Send"}
        </button>
      </div>
    </form>
  );
}

export default ChatComposer;
