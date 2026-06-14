export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressImage(
  base64: string,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64);
      }
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

export async function handleImageUpload(
  event: React.ChangeEvent<HTMLInputElement>
): Promise<string | null> {
  const file = event.target.files?.[0];
  if (!file) return null;
  
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件');
    return null;
  }
  
  try {
    const base64 = await fileToBase64(file);
    const compressed = await compressImage(base64);
    return compressed;
  } catch (e) {
    console.error('Image upload failed:', e);
    alert('图片上传失败，请重试');
    return null;
  }
}
