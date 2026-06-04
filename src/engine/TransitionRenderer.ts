import type { TransitionType } from '@/types/timeline';

export function applyTransition(
  ctx: CanvasRenderingContext2D,
  type: TransitionType,
  fromImage: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
  toImage: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
  progress: number,
  width: number,
  height: number
): void {
  ctx.save();
  
  switch (type) {
    case 'fade':
      ctx.globalAlpha = 1 - progress;
      ctx.drawImage(fromImage, 0, 0, width, height);
      ctx.globalAlpha = progress;
      ctx.drawImage(toImage, 0, 0, width, height);
      break;
      
    case 'dissolve':
      ctx.globalAlpha = 1;
      ctx.drawImage(fromImage, 0, 0, width, height);
      ctx.globalAlpha = progress;
      ctx.drawImage(toImage, 0, 0, width, height);
      break;
      
    case 'push':
      const pushOffset = width * progress;
      ctx.drawImage(fromImage, -pushOffset, 0, width, height);
      ctx.drawImage(toImage, width - pushOffset, 0, width, height);
      break;
      
    case 'slide':
      ctx.drawImage(fromImage, 0, 0, width, height);
      const slideOffset = width * progress;
      ctx.drawImage(toImage, slideOffset - width, 0, width, height);
      break;
  }
  
  ctx.restore();
}
