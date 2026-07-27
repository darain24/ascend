export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="system-font mb-1 text-[8px] font-bold tracking-[0.3em] text-blue-400/70">{eyebrow}</p>
        <h2 className="system-font text-sm font-bold tracking-[0.12em]">{title}</h2>
      </div>
      {action}
    </div>
  );
}
