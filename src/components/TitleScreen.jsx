export default function TitleScreen({ speedMode, onSelectSpeed, onStartBlank, onStartWithMaze }) {
  const speeds = ['Slow', 'Normal', 'Fast'];

  return (
    <main className="flex-1 p-6">
      <div className="max-w-xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-red-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">Dijkstra Pathfinder</h1>
        <p className="text-slate-600 leading-relaxed mb-6">
          Paint <span className="text-slate-900 font-semibold">walls</span> by dragging. Move the
          <span className="text-amber-600 font-semibold"> start</span> and
          <span className="text-red-600 font-semibold"> target</span>. Tap
          <span className="font-semibold"> Start</span> to explore how the algorithm finds the guaranteed shortest route.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <GuideTile
            title="SHORTEST"
            description="Like walking through city blocks: Dijkstra checks nearby squares first and expands outward until it reaches your destination."
            gradient="from-sky-100 to-white"
          />
          <GuideTile
            title="RELIABLE"
            description="If a route exists, it will find the best one. Think of a delivery robot weaving around boxes to the closest exit."
            gradient="from-emerald-100 to-white"
          />
          <GuideTile
            title="EVERYWHERE"
            description="Used in maps, network routing, games, and even planning errands efficiently."
            gradient="from-indigo-100 to-white"
          />
        </div>

        <div className="inline-flex rounded-2xl border border-slate-200 overflow-hidden mb-4" role="radiogroup">
          {speeds.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelectSpeed(label)}
              className={`px-4 py-2 text-sm ${speedMode === label ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'}`}
              role="radio"
              aria-checked={speedMode === label}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onStartBlank}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-semibold shadow-[0_12px_30px_rgba(15,23,42,.2)] active:scale-[.98]"
          >
            Start
          </button>
          <button
            type="button"
            onClick={onStartWithMaze}
            className="px-6 py-3 rounded-2xl border border-slate-200 bg-white font-semibold active:scale-[.98]"
          >
            Start with Maze
          </button>
        </div>
      </div>
    </main>
  );
}

function GuideTile({ title, description, gradient }) {
  return (
    <div className={`rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-b ${gradient}`}>
      <div className="px-4 pt-8 pb-4">
        <div className="text-3xl font-black tracking-tight">{title}</div>
        <p className="mt-2 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
