export function RankEmblem({ rank = "D", size = "large" }: { rank?: string; size?: "small" | "large" }) {
  return (
    <div className={`grid shrink-0 place-items-center rounded-full bg-indigo-50 font-semibold text-indigo-700 ${size === "large" ? "size-20 text-3xl" : "size-10 text-base"}`}>
      {rank}
    </div>
  );
}
