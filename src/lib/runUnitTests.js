import { generateMaze, key, lineCells, runDijkstra } from './pathfinding.js';

export function runPathfindingUnitTests() {
  if (import.meta.env.PROD) {
    return;
  }

  const line = lineCells(0, 0, 3, 3);
  console.assert(line.length === 4, `lineCells length expected 4, got ${line.length}`);
  console.assert(line.some(([r, c]) => r === 1 && c === 1), 'lineCells missing (1,1)');

  const openGrid = runDijkstra({
    rows: 3,
    cols: 3,
    start: { row: 0, col: 0 },
    target: { row: 2, col: 2 },
    isWall: () => false,
  });
  console.assert(openGrid.found === true, 'Dijkstra should find a path on empty grid');
  console.assert(openGrid.path.length === 5, `Path length expected 5, got ${openGrid.path.length}`);

  const partialWall = new Set([key(0, 1), key(2, 1)]);
  const aroundWall = runDijkstra({
    rows: 3,
    cols: 3,
    start: { row: 0, col: 0 },
    target: { row: 2, col: 2 },
    isWall: (row, col) => partialWall.has(key(row, col)),
  });
  console.assert(aroundWall.found === true, 'Dijkstra should route around partial wall');

  const barrier = new Set([key(1, 0), key(1, 1), key(1, 2)]);
  const blocked = runDijkstra({
    rows: 3,
    cols: 3,
    start: { row: 0, col: 0 },
    target: { row: 2, col: 2 },
    isWall: (row, col) => barrier.has(key(row, col)),
  });
  console.assert(blocked.found === false || blocked.path.length === 0, 'Dijkstra should not find a path when split by a full wall');

  const singleCell = runDijkstra({
    rows: 2,
    cols: 2,
    start: { row: 0, col: 0 },
    target: { row: 0, col: 0 },
    isWall: () => false,
  });
  console.assert(singleCell.found === true && singleCell.path.length === 1, 'When start==target, path should be [start]');

  const boxed = new Set([key(0, 1), key(1, 0)]);
  const trapped = runDijkstra({
    rows: 2,
    cols: 2,
    start: { row: 0, col: 0 },
    target: { row: 1, col: 1 },
    isWall: (row, col) => boxed.has(key(row, col)),
  });
  console.assert(trapped.found === false, 'No path when start is boxed in');

  const mazeWalls = generateMaze(11, 11, { row: 1, col: 1 }, { row: 9, col: 9 });
  console.assert(!mazeWalls.has(key(1, 1)) && !mazeWalls.has(key(9, 9)), 'Maze must keep start/target open');
  console.assert(mazeWalls.size > 0, 'Maze should create at least one wall');

  console.log('%cUnit tests passed', 'color:#16a34a');
}
