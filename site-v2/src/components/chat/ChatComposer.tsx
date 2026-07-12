import { useEffect, useState, type FormEvent } from "react";

type ChatComposerProps = {
  disabled?: boolean;
  initialValue?: string;
  onSend: (value: string) => Promise<boolean> | boolean;
};

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}

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
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        rows={3}
        placeholder="Ask about cloud architecture, IL5/IL6 experience, Terraform, or leadership…"
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-brand-400 focus:ring-[3px] focus:ring-brand-100/70 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="flex items-end justify-between gap-3">
        <p className="pb-1 text-xs text-slate-400">Answers draw only from this site's resume content.</p>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" fill="currentColor" />
              </svg>
              Thinking…
            </>
          ) : (
            <>
              <SendIcon /> Send
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default ChatComposer;
