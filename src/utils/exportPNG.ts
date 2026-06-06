export const gridToCanvas = (grid: string[][], cellSize: number = 24): HTMLCanvasElement => {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `${cellSize - 4}px Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const emoji = grid[y][x];
      if (emoji) {
        ctx.fillText(emoji, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2 + 2);
      }
    }
  }
  
  return canvas;
};

export const exportToPNG = (grid: string[][], filename: string = 'emoji-art.png'): void => {
  const canvas = gridToCanvas(grid, 32);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const generateThumbnail = (grid: string[][]): string => {
  const canvas = gridToCanvas(grid, 8);
  return canvas.toDataURL('image/png');
};
