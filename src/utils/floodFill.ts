export const floodFill = (
  grid: string[][],
  x: number,
  y: number,
  replaceEmoji: string
): string[][] => {
  const targetEmoji = grid[y]?.[x];
  if (targetEmoji === undefined || targetEmoji === replaceEmoji) {
    return grid.map(row => [...row]);
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = grid.map(row => [...row]);
  const stack: [number, number][] = [[x, y]];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!;
    const key = `${cx},${cy}`;
    
    if (visited.has(key)) continue;
    if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) continue;
    if (newGrid[cy][cx] !== targetEmoji) continue;

    visited.add(key);
    newGrid[cy][cx] = replaceEmoji;

    stack.push([cx + 1, cy]);
    stack.push([cx - 1, cy]);
    stack.push([cx, cy + 1]);
    stack.push([cx, cy - 1]);
  }

  return newGrid;
};
