type Props = { title: string; description: string };

export default function ComingSoon({ title, description }: Props) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      <div className="mt-6 flex min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-soft font-mono text-xs uppercase tracking-[0.1em] text-faint">
          soon
        </span>
        <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}
