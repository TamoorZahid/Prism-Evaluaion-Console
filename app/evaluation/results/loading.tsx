export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  );
}
