export interface Template {
  id: string;
  name: string;
  grid: string[][];
  thumbnail: string;
}

const GRID_SIZE = 32;

const createEmptyGrid = (): string[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
};

const createCatTemplate = (): string[][] => {
  const grid = createEmptyGrid();
  catFace(grid);
  return grid;
};

const catFace = (grid: string[][]) => {
  const orange = '🟠';
  const black = '⚫';
  const pink = '🩷';
  const white = '⚪';
  
  for (let y = 6; y < 26; y++) {
    for (let x = 4; x < 28; x++) {
      const cx = 16, cy = 16, r = 11;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) {
        grid[y][x] = orange;
      }
    }
  }
  
  for (let y = 4; y < 10; y++) {
    for (let x = 5; x < 11; x++) {
      if ((x - 8) ** 2 + (y - 7) ** 2 <= 9) {
        grid[y][x] = orange;
      }
    }
    for (let x = 21; x < 27; x++) {
      if ((x - 24) ** 2 + (y - 7) ** 2 <= 9) {
        grid[y][x] = orange;
      }
    }
  }
  
  for (let y = 12; y < 16; y++) {
    for (let x = 9; x < 14; x++) {
      if ((x - 11.5) ** 2 + (y - 13.5) ** 2 <= 4) {
        grid[y][x] = black;
      }
    }
    for (let x = 18; x < 23; x++) {
      if ((x - 20.5) ** 2 + (y - 13.5) ** 2 <= 4) {
        grid[y][x] = black;
      }
    }
  }
  
  grid[17][15] = pink;
  grid[17][16] = pink;
  grid[18][14] = black;
  grid[18][17] = black;
  
  for (let y = 19; y < 22; y++) {
    for (let x = 13; x < 19; x++) {
      if ((x - 15.5) ** 2 + (y - 20) ** 2 <= 6) {
        grid[y][x] = white;
      }
    }
  }
};

const createHeartTemplate = (): string[][] => {
  const grid = createEmptyGrid();
  const red = '❤️';
  const pink = '🩷';
  
  for (let y = 4; y < 28; y++) {
    for (let x = 4; x < 28; x++) {
      const cx1 = 11, cy1 = 10, r1 = 6;
      const cx2 = 21, cy2 = 10, r2 = 6;
      const dist1 = (x - cx1) ** 2 + (y - cy1) ** 2;
      const dist2 = (x - cx2) ** 2 + (y - cy2) ** 2;
      
      if (dist1 <= r1 * r1 || dist2 <= r2 * r2) {
        grid[y][x] = red;
      }
      
      if (y >= 10 && y < 26) {
        const dx = x - 16;
        if (Math.abs(dx) <= (22 - y)) {
          grid[y][x] = red;
        }
      }
    }
  }
  
  for (let y = 8; y < 14; y++) {
    for (let x = 8; x < 14; x++) {
      if ((x - 11) ** 2 + (y - 11) ** 2 <= 4) {
        grid[y][x] = pink;
      }
    }
    for (let x = 18; x < 24; x++) {
      if ((x - 21) ** 2 + (y - 11) ** 2 <= 4) {
        grid[y][x] = pink;
      }
    }
  }
  
  return grid;
};

const createChristmasTreeTemplate = (): string[][] => {
  const grid = createEmptyGrid();
  const green = '💚';
  const yellow = '💛';
  const red = '❤️';
  const brown = '🟤';
  const blue = '💙';
  
  for (let layer = 0; layer < 6; layer++) {
    const y = 4 + layer * 4;
    const width = 5 + layer * 4;
    const startX = 16 - Math.floor(width / 2);
    
    for (let x = startX; x < startX + width; x++) {
      if (x >= 0 && x < 32 && y >= 0 && y < 32) {
        grid[y][x] = green;
        if (y + 1 < 32) grid[y + 1][x] = green;
      }
    }
  }
  
  for (let y = 26; y < 30; y++) {
    for (let x = 14; x < 18; x++) {
      grid[y][x] = brown;
    }
  }
  
  grid[2][16] = yellow;
  grid[3][15] = yellow;
  grid[3][17] = yellow;
  
  const decorations = [
    [6, 12], [6, 20], [8, 10], [8, 22],
    [10, 14], [10, 18], [12, 8], [12, 24],
    [14, 12], [14, 20], [16, 10], [16, 22],
    [18, 14], [18, 18], [20, 12], [20, 20],
    [22, 14], [22, 18], [24, 16]
  ];
  
  const colors = [red, yellow, blue];
  decorations.forEach(([y, x], i) => {
    if (grid[y] && grid[y][x] === green) {
      grid[y][x] = colors[i % colors.length];
    }
  });
  
  return grid;
};

const createSunTemplate = (): string[][] => {
  const grid = createEmptyGrid();
  const yellow = '💛';
  const orange = '🧡';
  
  for (let y = 8; y < 24; y++) {
    for (let x = 8; x < 24; x++) {
      if ((x - 16) ** 2 + (y - 16) ** 2 <= 64) {
        grid[y][x] = yellow;
      }
    }
  }
  
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    for (let r = 10; r < 15; r++) {
      const x = Math.round(16 + Math.cos(angle) * r);
      const y = Math.round(16 + Math.sin(angle) * r);
      if (x >= 0 && x < 32 && y >= 0 && y < 32) {
        grid[y][x] = orange;
      }
    }
  }
  
  grid[13][13] = '⚫';
  grid[13][19] = '⚫';
  grid[17][14] = '🔴';
  grid[17][15] = '🔴';
  grid[17][16] = '🔴';
  grid[17][17] = '🔴';
  grid[17][18] = '🔴';
  
  return grid;
};

const createRainbowTemplate = (): string[][] => {
  const grid = createEmptyGrid();
  const colors = ['❤️', '🧡', '💛', '💚', '💙', '💜'];
  
  for (let band = 0; band < 6; band++) {
    const r = 14 - band * 2;
    for (let y = 4; y < 20; y++) {
      for (let x = 2; x < 30; x++) {
        const dist = (x - 16) ** 2 + (y - 20) ** 2;
        if (dist <= (r + 1) ** 2 && dist >= (r - 1) ** 2) {
          grid[y][x] = colors[band];
        }
      }
    }
  }
  
  for (let x = 2; x < 14; x++) {
    grid[24][x] = '☁️';
    grid[25][x] = '☁️';
  }
  for (let x = 18; x < 30; x++) {
    grid[24][x] = '☁️';
    grid[25][x] = '☁️';
  }
  
  return grid;
};

export const templates: Template[] = [
  {
    id: 'cat',
    name: '可爱猫咪',
    grid: createCatTemplate(),
    thumbnail: '🐱'
  },
  {
    id: 'heart',
    name: '爱心',
    grid: createHeartTemplate(),
    thumbnail: '❤️'
  },
  {
    id: 'christmas-tree',
    name: '圣诞树',
    grid: createChristmasTreeTemplate(),
    thumbnail: '🎄'
  },
  {
    id: 'sun',
    name: '太阳公公',
    grid: createSunTemplate(),
    thumbnail: '☀️'
  },
  {
    id: 'rainbow',
    name: '彩虹',
    grid: createRainbowTemplate(),
    thumbnail: '🌈'
  }
];
