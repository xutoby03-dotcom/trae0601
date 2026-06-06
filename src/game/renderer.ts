import { GameState, Tower, Monster, Projectile, Effect, Point } from '../types';
import { TOWER_CONFIGS, getTowerLevelConfig, CANVAS_WIDTH, CANVAS_HEIGHT } from '../configs';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.width = CANVAS_WIDTH;
    this.height = CANVAS_HEIGHT;
    canvas.width = this.width;
    canvas.height = this.height;
  }

  render(state: GameState) {
    this.clear();

    if (!state.map) return;

    this.drawBackground(state.map.background);
    this.drawPath(state.map.path, state.map.pathColor);
    this.drawTowerSlots(state.map.towerSlots, state.towers, state.selectedTowerType);

    for (const tower of state.towers) {
      this.drawTower(tower, state.selectedTower?.id === tower.id);
    }

    for (const monster of state.monsters) {
      this.drawMonster(monster);
    }

    for (const proj of state.projectiles) {
      this.drawProjectile(proj);
    }

    for (const effect of state.effects) {
      this.drawEffect(effect);
    }

    if (state.status === 'paused') {
      this.drawPauseOverlay();
    }
  }

  private clear() {
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawBackground(color: string) {
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, this.darkenColor(color, 20));
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  private drawPath(path: Point[], color: string) {
    if (path.length < 2) return;

    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 10;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 48;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      this.ctx.lineTo(path[i].x, path[i].y);
    }
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = this.darkenColor(color, 30);
    this.ctx.lineWidth = 36;
    this.ctx.beginPath();
    this.ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      this.ctx.lineTo(path[i].x, path[i].y);
    }
    this.ctx.stroke();

    this.ctx.strokeStyle = this.lightenColor(color, 10);
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      this.ctx.lineTo(path[i].x, path[i].y);
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawTowerSlots(slots: Point[], towers: Tower[], selectedType: string | null) {
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const hasTower = towers.some(t => t.slotIndex === i);

      if (!hasTower) {
        this.ctx.fillStyle = selectedType ? 'rgba(100, 200, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeStyle = selectedType ? 'rgba(100, 200, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(slot.x, slot.y, 28, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        if (selectedType) {
          this.ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
          this.ctx.beginPath();
          this.ctx.arc(slot.x, slot.y, 8, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
  }

  private drawTower(tower: Tower, isSelected: boolean) {
    const config = TOWER_CONFIGS[tower.type];
    const levelConfig = getTowerLevelConfig(tower.type, tower.level);

    if (isSelected) {
      this.ctx.fillStyle = `${config.color}15`;
      this.ctx.strokeStyle = `${config.color}40`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(tower.x, tower.y, levelConfig.range, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    }

    this.ctx.shadowColor = config.color;
    this.ctx.shadowBlur = 15;

    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.strokeStyle = config.color;
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    this.ctx.arc(tower.x, tower.y, 24, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.save();
    this.ctx.translate(tower.x, tower.y);
    this.ctx.rotate(tower.angle);

    this.ctx.fillStyle = config.color;
    this.ctx.shadowBlur = 10;

    if (tower.type === 'single') {
      this.ctx.fillRect(-4, -4, 30, 8);
      this.ctx.fillStyle = this.lightenColor(config.color, 30);
      this.ctx.fillRect(20, -3, 10, 6);
    } else if (tower.type === 'aoe') {
      this.ctx.beginPath();
      this.ctx.moveTo(25, 0);
      this.ctx.lineTo(0, -12);
      this.ctx.lineTo(0, 12);
      this.ctx.closePath();
      this.ctx.fill();
    } else if (tower.type === 'ice') {
      this.ctx.fillRect(-3, -15, 6, 30);
      this.ctx.fillRect(-15, -3, 30, 6);
      this.ctx.rotate(Math.PI / 4);
      this.ctx.fillRect(-3, -12, 6, 24);
    }

    this.ctx.restore();
    this.ctx.shadowBlur = 0;

    for (let i = 0; i <= tower.level; i++) {
      const starX = tower.x - 15 + i * 15;
      const starY = tower.y + 32;
      this.ctx.fillStyle = '#ffd700';
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = 5;
      this.drawStar(starX, starY, 5, 4, 2);
      this.ctx.shadowBlur = 0;
    }
  }

  private drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }

    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawMonster(monster: Monster) {
    this.ctx.shadowColor = monster.color;
    this.ctx.shadowBlur = 8;

    if (monster.isFlying) {
      const wingOffset = Math.sin(performance.now() / 100) * 3;
      this.ctx.fillStyle = this.darkenColor(monster.color, 20);
      this.ctx.beginPath();
      this.ctx.ellipse(monster.x - monster.size * 0.8, monster.y - wingOffset, monster.size * 0.5, monster.size * 0.3, -0.3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.ellipse(monster.x + monster.size * 0.8, monster.y - wingOffset, monster.size * 0.5, monster.size * 0.3, 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = monster.color;
    this.ctx.beginPath();
    this.ctx.arc(monster.x, monster.y, monster.size, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = this.darkenColor(monster.color, 30);
    this.ctx.beginPath();
    this.ctx.arc(monster.x, monster.y, monster.size * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(monster.x - monster.size * 0.25, monster.y - monster.size * 0.15, monster.size * 0.2, 0, Math.PI * 2);
    this.ctx.arc(monster.x + monster.size * 0.25, monster.y - monster.size * 0.15, monster.size * 0.2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(monster.x - monster.size * 0.25, monster.y - monster.size * 0.15, monster.size * 0.1, 0, Math.PI * 2);
    this.ctx.arc(monster.x + monster.size * 0.25, monster.y - monster.size * 0.15, monster.size * 0.1, 0, Math.PI * 2);
    this.ctx.fill();

    if (monster.slowTimer > 0) {
      this.ctx.strokeStyle = '#44aaff';
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = '#44aaff';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(monster.x, monster.y, monster.size + 6, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    const hpBarWidth = monster.size * 2;
    const hpBarHeight = 4;
    const hpBarY = monster.y - monster.size - 10;
    const hpPercent = monster.hp / monster.maxHp;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(monster.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

    const hpColor = hpPercent > 0.6 ? '#00ff88' : hpPercent > 0.3 ? '#ffaa00' : '#ff4444';
    this.ctx.fillStyle = hpColor;
    this.ctx.fillRect(monster.x - hpBarWidth / 2, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
  }

  private drawProjectile(proj: Projectile) {
    this.ctx.shadowColor = proj.color;
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = proj.color;

    if (proj.type === 'aoe') {
      this.ctx.beginPath();
      this.ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (proj.type === 'ice') {
      this.ctx.save();
      this.ctx.translate(proj.x, proj.y);
      this.ctx.rotate(performance.now() / 100);
      this.ctx.fillRect(-2, -8, 4, 16);
      this.ctx.fillRect(-8, -2, 16, 4);
      this.ctx.restore();
    } else {
      this.ctx.beginPath();
      this.ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.shadowBlur = 0;
  }

  private drawEffect(effect: Effect) {
    const progress = effect.elapsed / effect.duration;
    const alpha = 1 - progress;

    this.ctx.globalAlpha = alpha;

    if (effect.type === 'explosion') {
      const radius = (effect.radius || 30) * (0.5 + progress * 0.5);
      this.ctx.fillStyle = effect.color || '#ff6644';
      this.ctx.shadowColor = effect.color || '#ff6644';
      this.ctx.shadowBlur = 20;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (effect.type === 'hit') {
      const radius = (effect.radius || 15) * (1 - progress * 0.5);
      this.ctx.strokeStyle = effect.color || '#fff';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = effect.color || '#fff';
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (effect.type === 'slow') {
      const radius = (effect.radius || 25) * (1 + progress);
      this.ctx.strokeStyle = '#44aaff';
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = '#44aaff';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (effect.type === 'build') {
      const radius = (effect.radius || 40) * progress;
      this.ctx.strokeStyle = effect.color || '#fff';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = effect.color || '#fff';
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  private drawPauseOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowColor = '#6495ff';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('游戏暂停', this.width / 2, this.height / 2);
    this.ctx.shadowBlur = 0;
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } {
    const rect = this.ctx.canvas.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }
}
