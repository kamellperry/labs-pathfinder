export const key = (row, col) => `${row},${col}`;
export const fromKey = (value) => value.split(',').map(Number);
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function lineCells(r0, c0, r1, c1) {
  const cells = [];
  const deltaRow = Math.abs(r1 - r0);
  const deltaCol = Math.abs(c1 - c0);
  const stepRow = r0 < r1 ? 1 : -1;
  const stepCol = c0 < c1 ? 1 : -1;
  let error = (deltaRow > deltaCol ? deltaRow : -deltaCol) / 2;
  let row = r0;
  let col = c0;

  while (true) {
    cells.push([row, col]);
    if (row === r1 && col === c1) {
      break;
    }

    const doubleError = error;
    if (doubleError > -deltaRow) {
      error -= deltaCol;
      row += stepRow;
    }
    if (doubleError < deltaCol) {
      error += deltaRow;
      col += stepCol;
    }
  }

  return cells;
}

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) {
      return null;
    }

    const top = this.heap[0];
    const tail = this.heap.pop();
    if (this.heap.length > 0 && tail) {
      this.heap[0] = tail;
      this.bubbleDown(0);
    }

    return top;
  }

  get size() {
    return this.heap.length;
  }

  bubbleUp(index) {
    let current = index;
    while (current > 0) {
      const parent = (current - 1) >> 1;
      if (this.heap[parent][0] <= this.heap[current][0]) {
        break;
      }
      [this.heap[parent], this.heap[current]] = [this.heap[current], this.heap[parent]];
      current = parent;
    }
  }

  bubbleDown(index) {
    let current = index;
    const length = this.heap.length;

    while (true) {
      const left = current * 2 + 1;
      const right = left + 1;
      let smallest = current;

      if (left < length && this.heap[left][0] < this.heap[smallest][0]) {
        smallest = left;
      }

      if (right < length && this.heap[right][0] < this.heap[smallest][0]) {
        smallest = right;
      }

      if (smallest === current) {
        break;
      }

      [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
      current = smallest;
    }
  }
}

export function runDijkstra({ rows, cols, start, target, isWall }) {
  const startKey = key(start.row, start.col);
  const targetKey = key(target.row, target.col);

  const distance = new Map();
  const previous = new Map();
  const visitedOrder = [];
  const seen = new Set();
  const heap = new MinHeap();

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cellKey = key(row, col);
      distance.set(cellKey, Infinity);
      previous.set(cellKey, null);
    }
  }

  distance.set(startKey, 0);
  heap.push([0, startKey]);

  const inBounds = (row, col) => row >= 0 && row < rows && col >= 0 && col < cols;
  const neighbors = (row, col) =>
    [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ].filter(([r, c]) => inBounds(r, c) && !isWall(r, c));

  while (heap.size > 0) {
    const entry = heap.pop();
    if (!entry) {
      break;
    }

    const [dist, cellKey] = entry;
    if (seen.has(cellKey)) {
      continue;
    }

    seen.add(cellKey);
    visitedOrder.push(cellKey);

    if (cellKey === targetKey) {
      break;
    }

    const [row, col] = fromKey(cellKey);
    for (const [neighborRow, neighborCol] of neighbors(row, col)) {
      const neighborKey = key(neighborRow, neighborCol);
      const candidate = dist + 1;
      if (candidate < (distance.get(neighborKey) ?? Infinity)) {
        distance.set(neighborKey, candidate);
        previous.set(neighborKey, cellKey);
        heap.push([candidate, neighborKey]);
      }
    }
  }

  const path = [];
  if (previous.has(targetKey) || startKey === targetKey) {
    let pointer = targetKey;
    if (previous.get(pointer) !== null || pointer === startKey) {
      while (pointer) {
        path.push(pointer);
        pointer = previous.get(pointer);
      }
      path.reverse();
    }
  }

  return {
    visitedOrder,
    path,
    found: path.length > 0,
  };
}

export function generateMaze(rows, cols, start, target) {
  const inBounds = (row, col) => row >= 0 && row < rows && col >= 0 && col < cols;
  const walls = new Set();

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      walls.add(key(row, col));
    }
  }

  const carve = (row, col) => {
    walls.delete(key(row, col));
  };

  const startRow = Math.max(1, Math.min(rows - 2, start.row | 1));
  const startCol = Math.max(1, Math.min(cols - 2, start.col | 1));
  carve(startRow, startCol);

  const stack = [[startRow, startCol]];
  const directions = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ];

  while (stack.length > 0) {
    const [row, col] = stack[stack.length - 1];
    const options = directions
      .map(([dr, dc]) => [row + dr, col + dc, row + dr / 2, col + dc / 2])
      .filter(([nr, nc]) => inBounds(nr, nc) && walls.has(key(nr, nc)));

    if (options.length === 0) {
      stack.pop();
      continue;
    }

    const [nextRow, nextCol, wallRow, wallCol] = options[Math.floor(Math.random() * options.length)];
    carve(wallRow, wallCol);
    carve(nextRow, nextCol);
    stack.push([nextRow, nextCol]);
  }

  walls.delete(key(start.row, start.col));
  walls.delete(key(target.row, target.col));

  return walls;
}
