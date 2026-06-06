import { Fish, Food, Decoration } from '../../store/types';
import { FISH_CONFIGS, DECORATION_CONFIGS, TANK_WIDTH, TANK_HEIGHT, SAND_HEIGHT } from '../../utils/constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private time: number = 0;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  render(fish: Fish[], foods: Food[], decorations: Decoration[], deltaTime: number) {
    this.time += deltaTime;
    this.drawBackground();
    this.drawSand();
    this.drawDecorations(decorations);
    this.drawFood(foods);
    this.drawFish(fish);
    this.drawWaterEffect();
  }

  private drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(0.5, '#1e3a5f');
    gradient.addColorStop(1, '#2563eb');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < 20; i++) {
      const x = (i * 53 + this.time * 10) % this.width;
      const y = (i * 37) % (this.height - SAND_HEIGHT);
      const size = 2 + Math.sin(this.time + i) * 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(this.time + i) * 0.05})`;
      this.ctx.fill();
    }
  }

  private drawSand() {
    const sandY = this.height - SAND_HEIGHT;
    const gradient = this.ctx.createLinearGradient(0, sandY, 0, this.height);
    gradient.addColorStop(0, '#d4a574');
    gradient.addColorStop(0.3, '#c4956a');
    gradient.addColorStop(1, '#a67c52');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, sandY, this.width, SAND_HEIGHT);

    for (let i = 0; i < 50; i++) {
      const x = (i * 19) % this.width;
      const y = sandY + 5 + (i * 7) % (SAND_HEIGHT - 10);
      this.ctx.beginPath();
      this.ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(139, 90, 43, ${0.3 + Math.random() * 0.3})`;
      this.ctx.fill();
    }
  }

  private drawDecorations(decorations: Decoration[]) {
    decorations.forEach((deco) => {
      const config = DECORATION_CONFIGS[deco.type];
      const wobble = Math.sin(this.time * 2 + deco.x * 0.05) * 2;
      
      this.ctx.save();
      this.ctx.translate(deco.x, deco.y + wobble);
      this.ctx.font = `${config.height}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'bottom';
      this.ctx.fillText(config.emoji, 0, 0);
      this.ctx.restore();
    });
  }

  private drawFood(foods: Food[]) {
    foods.forEach((food) => {
      if (food.eaten) return;
      
      this.ctx.save();
      this.ctx.translate(food.x, food.y);
      
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
      const gradient = this.ctx.createRadialGradient(-1, -1, 0, 0, 0, 4);
      gradient.addColorStop(0, '#f5deb3');
      gradient.addColorStop(1, '#d4a574');
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  private drawFish(fish: Fish[]) {
    fish.forEach((f) => {
      const config = FISH_CONFIGS[f.type];
      const size = f.size === 'small' ? 20 : f.size === 'medium' ? 30 : 45;
      const wobble = Math.sin(f.wobblePhase) * 3;
      
      this.ctx.save();
      this.ctx.translate(f.x, f.y + wobble);
      
      if (!f.facingRight) {
        this.ctx.scale(-1, 1);
      }

      if (f.type === 'octopus') {
        this.drawOctopus(size, config.colors, f.wobblePhase);
      } else {
        this.drawRegularFish(size, config.colors, f.wobblePhase, f.type);
      }

      this.ctx.restore();
    });
  }

  private drawRegularFish(size: number, colors: string[], wobblePhase: number, type: string) {
    const tailWobble = Math.sin(wobblePhase * 2) * 0.3;
    
    this.ctx.save();
    
    this.ctx.rotate(tailWobble * 0.5);
    
    const bodyGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    bodyGradient.addColorStop(0, colors[0]);
    bodyGradient.addColorStop(0.7, colors[1] || colors[0]);
    bodyGradient.addColorStop(1, colors[2] || colors[0]);
    
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = bodyGradient;
    this.ctx.fill();

    if (type === 'clownfish') {
      for (let i = -1; i <= 1; i++) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(i * size * 0.35 - 3, -size * 0.4, 6, size * 0.8);
      }
    }

    this.ctx.beginPath();
    this.ctx.arc(size * 0.5, -size * 0.15, size * 0.12, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(size * 0.55, -size * 0.15, size * 0.06, 0, Math.PI * 2);
    this.ctx.fillStyle = '#000000';
    this.ctx.fill();

    this.ctx.save();
    this.ctx.translate(-size * 0.9, 0);
    this.ctx.rotate(tailWobble);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-size * 0.6, -size * 0.4);
    this.ctx.quadraticCurveTo(-size * 0.8, 0, -size * 0.6, size * 0.4);
    this.ctx.closePath();
    this.ctx.fillStyle = colors[1] || colors[0];
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.moveTo(-size * 0.2, -size * 0.4);
    this.ctx.quadraticCurveTo(0, -size * 0.7, size * 0.2, -size * 0.4);
    this.ctx.fillStyle = colors[2] || colors[0];
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(-size * 0.2, size * 0.4);
    this.ctx.quadraticCurveTo(0, size * 0.6, size * 0.2, size * 0.4);
    this.ctx.fillStyle = colors[2] || colors[0];
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawOctopus(size: number, colors: string[], wobblePhase: number) {
    this.ctx.save();
    
    const tentacleWobble = Math.sin(wobblePhase * 2) * 0.2;
    
    const bodyGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    bodyGradient.addColorStop(0, colors[0]);
    bodyGradient.addColorStop(1, colors[1] || colors[0]);
    
    this.ctx.beginPath();
    this.ctx.ellipse(0, -size * 0.2, size * 0.8, size * 0.7, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = bodyGradient;
    this.ctx.fill();

    for (let i = 0; i < 6; i++) {
      const angle = (-Math.PI / 2) + (i - 2.5) * 0.3;
      const wobble = Math.sin(wobblePhase * 3 + i) * 0.3;
      
      this.ctx.save();
      this.ctx.translate(Math.cos(angle) * size * 0.4, size * 0.3 + Math.sin(angle) * size * 0.2);
      this.ctx.rotate(angle + tentacleWobble + wobble);
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.quadraticCurveTo(size * 0.3, size * 0.1, size * 0.6, 0);
      this.ctx.quadraticCurveTo(size * 0.3, -size * 0.1, 0, 0);
      this.ctx.fillStyle = colors[1] || colors[0];
      this.ctx.fill();
      
      this.ctx.restore();
    }

    this.ctx.beginPath();
    this.ctx.ellipse(-size * 0.25, -size * 0.3, size * 0.15, size * 0.18, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(-size * 0.22, -size * 0.28, size * 0.08, 0, Math.PI * 2);
    this.ctx.fillStyle = '#000000';
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(size * 0.15, -size * 0.3, size * 0.15, size * 0.18, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(size * 0.18, -size * 0.28, size * 0.08, 0, Math.PI * 2);
    this.ctx.fillStyle = '#000000';
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawWaterEffect() {
    this.ctx.save();
    
    for (let i = 0; i < 5; i++) {
      const y = (this.time * 20 + i * 100) % (this.height - SAND_HEIGHT);
      const waveOffset = Math.sin(this.time * 2 + i) * 10;
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      for (let x = 0; x <= this.width; x += 20) {
        this.ctx.lineTo(x, y + Math.sin(x * 0.02 + this.time + i) * 3 + waveOffset * 0.1);
      }
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 - i * 0.005})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    for (let i = 0; i < 10; i++) {
      const x = (this.time * 15 + i * 97) % this.width;
      const y = this.height - SAND_HEIGHT - 20 - (i * 31) % 100 + Math.sin(this.time * 2 + i) * 10;
      const size = 3 + Math.sin(this.time + i) * 2;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(this.time + i) * 0.05})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
