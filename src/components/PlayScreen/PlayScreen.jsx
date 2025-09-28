import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStageSize } from '../../hooks/useStageSize.js';
import { useGridSize } from '../../hooks/useGridSize.js';
import ControlBar from './ControlBar.jsx';
import PathfinderBoard from './PathfinderBoard.jsx';
import PathfinderCell from './PathfinderCell.jsx';
import { fromKey, generateMaze, key, lineCells, runDijkstra, sleep } from '../../lib/pathfinding.js';

const GRID_ROWS = 22;
const GRID_COLS = 18;
const SPEED_PRESETS = {
  Slow: { VISIT: 22, PATH: 70 },
  Normal: { VISIT: 12, PATH: 42 },
  Fast: { VISIT: 6, PATH: 24 },
};

const COLORS = {
  obstacleTop: '#1A2233',
  obstacleBottom: '#0B1220',
  visitedTop: 'hsla(195, 92%, 62%, 0.55)',
  visitedBottom: 'hsla(195, 92%, 62%, 0.28)',
  pathA: '#2E6BFE',
  pathB: '#A4BEFF',
  start: '#F7C948',
  target: '#FF3B30',
};

const CELL_STYLES = Object.freeze({
  default: Object.freeze({ backgroundColor: 'transparent' }),
  start: Object.freeze({ backgroundColor: COLORS.start }),
  target: Object.freeze({ backgroundColor: COLORS.target }),
  wall: Object.freeze({
    background: `linear-gradient(180deg, ${COLORS.obstacleTop}, ${COLORS.obstacleBottom})`,
  }),
  path: Object.freeze({
    background: `linear-gradient(135deg, ${COLORS.pathA}, ${COLORS.pathB})`,
    backgroundSize: '200% 200%',
  }),
  visited: Object.freeze({
    background: `linear-gradient(180deg, ${COLORS.visitedTop}, ${COLORS.visitedBottom})`,
  }),
});

const CELL_INITIAL_VARIANTS = Object.freeze({
  default: Object.freeze({ borderRadius: '0%', scale: 1 }),
  visited: Object.freeze({ borderRadius: '50%', scale: 0.55 }),
});

const CELL_ANIMATE_VARIANT = Object.freeze({ borderRadius: '0%', scale: 1 });

const CELL_TRANSITION = Object.freeze({ ease: 'easeOut', duration: 0.18 });

export default function PlayScreen({ speedMode, mode }) {
  const stageRef = useRef(null);
  const lastCellRef = useRef(null);
  const currentRunIdRef = useRef(0);

  const [isPointerDown, setIsPointerDown] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [paintMode, setPaintMode] = useState('wall');

  const [start, setStart] = useState({ row: 3, col: 2 });
  const [target, setTarget] = useState({ row: 18, col: 15 });
  const wallsRef = useRef(new Set());
  const visitedRef = useRef(new Set());
  const pathRef = useRef(new Set());
  const [wallsVersion, setWallsVersion] = useState(0);
  const [visitedVersion, setVisitedVersion] = useState(0);
  const [pathVersion, setPathVersion] = useState(0);
  const [wave, setWave] = useState({ x: 0, y: 0, key: 0 });
  const [mazeRefreshKey, setMazeRefreshKey] = useState(0);

  const startRef = useRef(start);
  const targetRef = useRef(target);

  const replaceWalls = useCallback((nextSet) => {
    wallsRef.current = nextSet;
    setWallsVersion((prev) => prev + 1);
  }, []);

  const updateWalls = useCallback((updater) => {
    const next = new Set(wallsRef.current);
    updater(next);
    wallsRef.current = next;
    setWallsVersion((prev) => prev + 1);
  }, []);

  const replaceVisited = useCallback((nextSet) => {
    visitedRef.current = nextSet;
    setVisitedVersion((prev) => prev + 1);
  }, []);

  const addVisitedCell = useCallback((cellKey) => {
    if (visitedRef.current.has(cellKey)) {
      return;
    }
    const next = new Set(visitedRef.current);
    next.add(cellKey);
    visitedRef.current = next;
    setVisitedVersion((prev) => prev + 1);
  }, []);

  const replacePathSet = useCallback((nextSet) => {
    pathRef.current = nextSet;
    setPathVersion((prev) => prev + 1);
  }, []);

  const addPathCell = useCallback((cellKey) => {
    if (pathRef.current.has(cellKey)) {
      return;
    }
    const next = new Set(pathRef.current);
    next.add(cellKey);
    pathRef.current = next;
    setPathVersion((prev) => prev + 1);
  }, []);

  const visitDelay = SPEED_PRESETS[speedMode]?.VISIT ?? SPEED_PRESETS.Normal.VISIT;
  const pathDelay = SPEED_PRESETS[speedMode]?.PATH ?? SPEED_PRESETS.Normal.PATH;

  const stageSize = useStageSize(stageRef, {
    active: true,
    reservedAbove: 80,
    reservedBelow: 140,
  });

  const gridSize = useGridSize({ width: stageSize.width, height: stageSize.height }, GRID_ROWS, GRID_COLS);

  const bumpRunId = useCallback(() => {
    currentRunIdRef.current += 1;
    return currentRunIdRef.current;
  }, []);

  const clearAlgorithmPaint = useCallback(() => {
    const runId = bumpRunId();
    replaceVisited(new Set());
    replacePathSet(new Set());
    return runId;
  }, [bumpRunId, replacePathSet, replaceVisited]);

  const resetBoard = useCallback(() => {
    clearAlgorithmPaint();
    replaceWalls(new Set());
  }, [clearAlgorithmPaint, replaceWalls]);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    if (mode !== 'maze' && mazeRefreshKey === 0) {
      return;
    }

    replaceWalls(generateMaze(GRID_ROWS, GRID_COLS, startRef.current, targetRef.current));
  }, [mazeRefreshKey, mode, replaceWalls]);

  useEffect(() => {
    updateWalls((draft) => {
      draft.delete(key(start.row, start.col));
      draft.delete(key(target.row, target.col));
    });
  }, [start, target, updateWalls]);

  useEffect(() => {
    if (!isPointerDown) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';

    const preventScroll = (event) => event.preventDefault();
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [isPointerDown]);

  const isWall = useCallback((row, col) => wallsRef.current.has(key(row, col)), []);

  const cellCenterPx = useCallback(
    (row, col) => ({
      x: (col + 0.5) * gridSize.cell,
      y: (row + 0.5) * gridSize.cell,
    }),
    [gridSize.cell],
  );

  const eventToCell = useCallback(
    (event) => {
      const grid = document.getElementById('gridWrapper');
      if (!grid || !gridSize.cell) {
        return null;
      }

      const rect = grid.getBoundingClientRect();
      const pointerX = (event.clientX ?? event.touches?.[0]?.clientX) - rect.left;
      const pointerY = (event.clientY ?? event.touches?.[0]?.clientY) - rect.top;
      const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(pointerX / gridSize.cell)));
      const row = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(pointerY / gridSize.cell)));
      return { row, col };
    },
    [gridSize.cell],
  );

  const applyStroke = useCallback(
    (r0, c0, r1, c1, mode) => {
      const cells = lineCells(r0, c0, r1, c1);
      updateWalls((draft) => {
        for (const [row, col] of cells) {
          if ((row === start.row && col === start.col) || (row === target.row && col === target.col)) {
            continue;
          }
          const cellKey = key(row, col);
          if (mode === 'wall') {
            draft.add(cellKey);
          } else {
            draft.delete(cellKey);
          }
        }
      });
    },
    [start, target, updateWalls],
  );

  const handlePointerDown = useCallback(
    (event) => {
      event.preventDefault();
      const grid = document.getElementById('gridWrapper');
      grid?.setPointerCapture?.(event.pointerId ?? 1);

      setIsPointerDown(true);
      clearAlgorithmPaint();

      const cell = eventToCell(event);
      if (!cell) {
        return;
      }

      lastCellRef.current = cell;

      if (cell.row === start.row && cell.col === start.col) {
        setDragging('start');
        return;
      }

      if (cell.row === target.row && cell.col === target.col) {
        setDragging('target');
        return;
      }

      const cellKey = key(cell.row, cell.col);
      const existingWall = wallsRef.current.has(cellKey);
      setPaintMode(existingWall ? 'erase' : 'wall');
      updateWalls((draft) => {
        if (existingWall) {
          draft.delete(cellKey);
        } else if (!(cell.row === start.row && cell.col === start.col) && !(cell.row === target.row && cell.col === target.col)) {
          draft.add(cellKey);
        }
      });
    },
    [clearAlgorithmPaint, eventToCell, start, target, updateWalls],
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!isPointerDown) {
        return;
      }

      event.preventDefault();
      const cell = eventToCell(event);
      if (!cell) {
        return;
      }

      if (dragging === 'start') {
        if (!(cell.row === target.row && cell.col === target.col)) {
          setStart({ row: cell.row, col: cell.col });
        }
        return;
      }

      if (dragging === 'target') {
        if (!(cell.row === start.row && cell.col === start.col)) {
          setTarget({ row: cell.row, col: cell.col });
        }
        return;
      }

      const last = lastCellRef.current;
      if (!last || (last.row === cell.row && last.col === cell.col)) {
        return;
      }

      applyStroke(last.row, last.col, cell.row, cell.col, paintMode);
      lastCellRef.current = cell;
    },
    [applyStroke, dragging, eventToCell, isPointerDown, paintMode, start, target, updateWalls],
  );

  const handlePointerUp = useCallback((event) => {
    setIsPointerDown(false);
    setDragging(null);
    lastCellRef.current = null;
    const grid = document.getElementById('gridWrapper');
    grid?.releasePointerCapture?.(event.pointerId ?? 1);
  }, []);

  const runAlgorithm = useCallback(async () => {
    const runId = clearAlgorithmPaint();
    const { visitedOrder, path, found } = runDijkstra({
      rows: GRID_ROWS,
      cols: GRID_COLS,
      start,
      target,
      isWall,
    });

    for (let index = 0; index < visitedOrder.length; index += 1) {
      if (currentRunIdRef.current !== runId) {
        return;
      }
      const cellKey = visitedOrder[index];
      const [row, col] = fromKey(cellKey);
      if (currentRunIdRef.current !== runId) {
        return;
      }
      addVisitedCell(cellKey);
      if (currentRunIdRef.current !== runId) {
        return;
      }
      const { x, y } = cellCenterPx(row, col);
      if (currentRunIdRef.current !== runId) {
        return;
      }
      setWave({ x, y, key: index });
      // eslint-disable-next-line no-await-in-loop
      await sleep(visitDelay);
      if (currentRunIdRef.current !== runId) {
        return;
      }
      if (row === target.row && col === target.col) {
        break;
      }
    }

    if (currentRunIdRef.current !== runId) {
      return;
    }

    if (found) {
      for (let index = 0; index < path.length; index += 1) {
        if (currentRunIdRef.current !== runId) {
          return;
        }
        const cellKey = path[index];
        if (currentRunIdRef.current !== runId) {
          return;
        }
        addPathCell(cellKey);
        // eslint-disable-next-line no-await-in-loop
        await sleep(pathDelay);
        if (currentRunIdRef.current !== runId) {
          return;
        }
      }
    }
  }, [
    addPathCell,
    addVisitedCell,
    cellCenterPx,
    clearAlgorithmPaint,
    isWall,
    pathDelay,
    start,
    target,
    visitDelay,
  ]);

  const handleRun = useCallback(() => {
    bumpRunId();
    return runAlgorithm();
  }, [bumpRunId, runAlgorithm]);

  const handleGenerateMaze = useCallback(() => {
    clearAlgorithmPaint();
    replaceWalls(generateMaze(GRID_ROWS, GRID_COLS, start, target));
  }, [clearAlgorithmPaint, replaceWalls, start, target]);

  const gridCells = useMemo(
    () =>
      Array.from({ length: GRID_ROWS }, (_, row) =>
        Array.from({ length: GRID_COLS }, (_, col) => {
          const cellKey = key(row, col);
          const isStart = row === start.row && col === start.col;
          const isTarget = row === target.row && col === target.col;
          const wall = wallsRef.current.has(cellKey);
          const visitedCell = visitedRef.current.has(cellKey);
          const pathCell = pathRef.current.has(cellKey);

          let style = CELL_STYLES.default;
          if (isStart) {
            style = CELL_STYLES.start;
          } else if (isTarget) {
            style = CELL_STYLES.target;
          } else if (wall) {
            style = CELL_STYLES.wall;
          } else if (pathCell) {
            style = CELL_STYLES.path;
          } else if (visitedCell) {
            style = CELL_STYLES.visited;
          }

          const initialVariant = visitedCell
            ? CELL_INITIAL_VARIANTS.visited
            : CELL_INITIAL_VARIANTS.default;

          return (
            <PathfinderCell
              key={cellKey}
              visited={visitedCell}
              path={pathCell}
              wall={wall}
              isStart={isStart}
              isTarget={isTarget}
              style={style}
              initialVariant={initialVariant}
              animateVariant={CELL_ANIMATE_VARIANT}
              transition={CELL_TRANSITION}
            />
          );
        }),
      ),
    [
      pathVersion,
      start.col,
      start.row,
      target.col,
      target.row,
      visitedVersion,
      wallsVersion,
    ],
  );

  const waveDiameter = useMemo(() => {
    const { width = 0, height = 0 } = gridSize;
    return Math.max(400, Math.sqrt(width ** 2 + height ** 2) + 120);
  }, [gridSize]);

  const waveGradient = useMemo(() => {
    const hue = 190 + (wave.key % 8) * 2;
    return `radial-gradient(circle at center, hsla(${hue}, 90%, 60%, 0.16) 0%, hsla(${hue + 6}, 90%, 60%, 0.10) 40%, hsla(${hue + 12}, 90%, 60%, 0.05) 65%, hsla(${hue + 16}, 90%, 60%, 0) 80%)`;
  }, [wave.key]);

  return (
    <motion.main
      key="play"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex-1 px-3 sm:px-6 pt-3"
    >
      <PathfinderBoard
        stageRef={stageRef}
        stageHeight={stageSize.height}
        gridSize={gridSize}
        rows={GRID_ROWS}
        cols={GRID_COLS}
        gridCells={gridCells}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        wave={wave}
        waveDiameter={waveDiameter}
        waveGradient={waveGradient}
        visitDelay={visitDelay}
      />
      <ControlBar
        onRun={handleRun}
        onReset={resetBoard}
        onMaze={() => {
          clearAlgorithmPaint();
          setMazeRefreshKey((value) => value + 1);
        }}
      />
    </motion.main>
  );
}
