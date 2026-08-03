export function SkeletonBar({ width = "100%", height = "14px", className = "" }) {
  return (
    <div
      className={`rounded-md bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl px-5 py-5 shadow-sm">
      <SkeletonBar width="40%" height="12px" className="mb-3" />
      <SkeletonBar width="70%" height="26px" className="mb-2" />
      <SkeletonBar width="50%" height="12px" />
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <div className="flex gap-4 px-2.5 py-3 border-b border-slate-50">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBar key={i} width={i === 0 ? "140px" : "90px"} height="12px" />
      ))}
    </div>
  );
}

export function SkeletonListCard() {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl px-4 py-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <SkeletonBar width="45%" height="14px" />
        <SkeletonBar width="60px" height="20px" className="rounded-full" />
      </div>
      <SkeletonBar width="65%" height="11px" className="mb-1.5" />
      <SkeletonBar width="40%" height="11px" />
    </div>
  );
}
