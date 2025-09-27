import { AnimatePresence, motion } from 'framer-motion';

export default function PathfinderBoard({
  stageRef,
  stageHeight,
  gridSize,
  rows,
  cols,
  gridCells,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  wave,
  waveDiameter,
  waveGradient,
  visitDelay,
}) {
  return (
    <div
      ref={stageRef}
      style={{ height: stageHeight }}
      className="relative w-full max-w-5xl mx-auto rounded-3xl border border-slate-200 overflow-hidden bg-white touch-none select-none"
    >
      <div
        id="gridWrapper"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute inset-0 m-auto grid"
        style={{
          width: gridSize.width ? `${gridSize.width}px` : '100%',
          height: gridSize.height ? `${gridSize.height}px` : '100%',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {gridCells}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage:
              `linear-gradient(to right, #E6EEF7 1px, transparent 1px), ` +
              `linear-gradient(to bottom, #E6EEF7 1px, transparent 1px)`,
            backgroundSize: `${Math.max(8, gridSize.cell || 24)}px 100%, 100% ${Math.max(8, gridSize.cell || 24)}px`,
            backgroundRepeat: 'repeat, repeat',
          }}
        />
        <AnimatePresence>
          <motion.div
            key={`wave-${wave.key}`}
            initial={{ opacity: 0.36, scale: 0 }}
            animate={{ opacity: [0.36, 0.18, 0], scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: Math.max(0.5, visitDelay / 240), ease: 'easeOut' }}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: waveDiameter,
              height: waveDiameter,
              left: `calc(${wave.x}px - ${waveDiameter / 2}px)`,
              top: `calc(${wave.y}px - ${waveDiameter / 2}px)`,
              background: waveGradient,
              filter: 'blur(1.5px)',
              mixBlendMode: 'multiply',
            }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
