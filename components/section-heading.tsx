export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        {eyebrow && <p className="mt-1 text-[11px] text-[var(--muted)]">{eyebrow}</p>}
      </div>
      {action}
    </div>
  );
}
