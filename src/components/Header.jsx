export default function Header({ onOpenMenu }) {
  return (
    <header className="px-4 py-3 sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-red-500" />
        <div className="text-base sm:text-lg font-bold tracking-tight">Dijkstra Pathfinder</div>
      </div>
      <button
        type="button"
        onClick={onOpenMenu}
        className="px-3 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 active:scale-[.98]"
        aria-label="Open menu"
      >
        ☰
      </button>
    </header>
  );
}
