export const createPlaceholderUmbrellaSVG = (color: string = '#4A90D9'): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="umbrellaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.7" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.2"/>
        </filter>
      </defs>
      <rect width="400" height="400" fill="#f0f4f8" rx="12"/>
      <g filter="url(#shadow)">
        <path d="M 200 80 Q 80 120 80 220 Q 140 210 200 220 Q 260 210 320 220 Q 320 120 200 80 Z" 
              fill="url(#umbrellaGrad)" stroke="${color}" stroke-width="2"/>
        <path d="M 200 80 Q 140 100 110 220" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.5"/>
        <path d="M 200 80 Q 260 100 290 220" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.5"/>
        <path d="M 200 80 Q 200 100 200 220" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.5"/>
        <line x1="200" y1="220" x2="200" y2="340" stroke="#555" stroke-width="4" stroke-linecap="round"/>
        <path d="M 200 340 Q 200 370 170 370" fill="none" stroke="#555" stroke-width="4" stroke-linecap="round"/>
        <circle cx="200" cy="80" r="8" fill="${color}" stroke="#fff" stroke-width="2"/>
      </g>
      <text x="200" y="390" text-anchor="middle" fill="#666" font-size="14" font-family="PingFang SC">雨伞照片</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

export const createHandlePlaceholderSVG = (color: string = '#555555'): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <rect width="400" height="400" fill="#f0f4f8" rx="12"/>
      <g transform="translate(130, 80)">
        <rect x="60" y="0" width="20" height="240" rx="4" fill="${color}"/>
        <path d="M 60 240 Q 60 280 20 280 Q -20 280 -20 250" 
              fill="none" stroke="${color}" stroke-width="20" stroke-linecap="round"/>
        <ellipse cx="70" cy="120" rx="30" ry="8" fill="${color}" opacity="0.3"/>
        <rect x="55" y="0" width="30" height="15" rx="3" fill="${color}"/>
      </g>
      <text x="200" y="380" text-anchor="middle" fill="#666" font-size="14" font-family="PingFang SC">伞柄照片</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

export const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建画布上下文'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
};
