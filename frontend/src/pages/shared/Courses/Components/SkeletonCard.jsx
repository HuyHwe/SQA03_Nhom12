const SkeletonCard = () => (
  <div className="rounded-2xl border bg-white overflow-hidden animate-pulse">
    <div className="aspect-[16/9] bg-slate-100" />
    <div className="p-5 space-y-2">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  </div>
);

export default SkeletonCard;