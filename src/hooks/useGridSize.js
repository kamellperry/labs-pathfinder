import { useEffect, useState } from 'react';

export function useGridSize(stageSize, rows, cols) {
  const [gridSize, setGridSize] = useState({ cell: 0, width: 0, height: 0 });

  useEffect(() => {
    const { width, height } = stageSize;
    if (!width || !height) {
      return;
    }

    const cell = Math.max(8, Math.floor(Math.min(width / cols, height / rows)));
    setGridSize({ cell, width: cell * cols, height: cell * rows });
  }, [stageSize, rows, cols]);

  return gridSize;
}
