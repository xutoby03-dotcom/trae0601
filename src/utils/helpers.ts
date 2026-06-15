export const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
};

export const formatDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateCN = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

export const formatDateTimeCN = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const base = formatDateCN(date);
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${base} ${hour}:${minute}`;
};

export const daysBetween = (date1Str: string, date2Str: string): number => {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor(Math.abs(d1.getTime() - d2.getTime()) / msPerDay);
};

export const daysFromToday = (dateStr: string): number => {
  return daysBetween(dateStr, formatDate(new Date()));
};

export const todayStr = (): string => formatDate(new Date());

export const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const compressImage = (file: File, maxSizeKB = 500): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1280;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.85;
        let result = '';
        const tryCompress = () => {
          result = canvas.toDataURL('image/jpeg', quality);
          const sizeKB = (result.length - 'data:image/jpeg;base64,'.length) * 0.75 / 1024;
          if (sizeKB > maxSizeKB && quality > 0.3) {
            quality -= 0.1;
            tryCompress();
          } else {
            resolve(result);
          }
        };
        tryCompress();
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

export const cn = (...args: (string | false | null | undefined)[]): string => {
  return args.filter(Boolean).join(' ');
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'available': return 'badge-available';
    case 'borrowed': return 'badge-borrowed';
    case 'inactive': return 'badge-inactive';
    default: return 'badge-inactive';
  }
};

export const getStatusBarClass = (status: string): string => {
  switch (status) {
    case 'available': return 'status-available';
    case 'borrowed': return 'status-borrowed';
    case 'inactive': return 'status-inactive';
    default: return 'status-inactive';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'available': return '可借用';
    case 'borrowed': return '借用中';
    case 'inactive': return '已停用';
    default: return status;
  }
};

export const getReminderTypeInfo = (type: string): { label: string; color: string; icon: string } => {
  switch (type) {
    case 'long_unverified':
      return { label: '长期未核对', color: 'bg-amber-400', icon: '⏰' };
    case 'trustee_moved':
      return { label: '托管人搬家', color: 'bg-coral-400', icon: '🚚' };
    case 'old_keys_unrecovered':
      return { label: '旧钥匙未回收', color: 'bg-navy-400', icon: '🔒' };
    default:
      return { label: type, color: 'bg-cream-500', icon: '📋' };
  }
};
