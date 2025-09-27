export default function ControlBar({ onRun, onReset, onMaze }) {
  return (
    <div className="w-full flex justify-center pt-4 pb-8">
      <div className="flex items-center rounded-full border border-slate-200 bg-white shadow-[0_10px_30px_rgba(2,6,23,.06)] overflow-hidden">
        <button
          type="button"
          onClick={onRun}
          className="px-6 py-3 text-base font-semibold bg-slate-900 text-white hover:opacity-95 focus:outline-none"
        >
          Run
        </button>
        <div className="w-px h-6 mx-1 bg-slate-200" aria-hidden />
        <button
          type="button"
          onClick={onReset}
          className="px-6 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50"
        >
          Reset
        </button>
        <div className="w-px h-6 mx-1 bg-slate-200" aria-hidden />
        <button
          type="button"
          onClick={onMaze}
          className="px-6 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50"
        >
          Maze
        </button>
      </div>
    </div>
  );
}
