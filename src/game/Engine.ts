import {
  Player,
  Obstacle,
  Coin,
  Particle,
  GameState,
  ThemeType,
  ObstacleType,
  GameStats,
  Skin,
} from '@/types/game';
import { themeColors, themeDifficulty, defaultConfig } from './Themes';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private groundY: number;

  private gameState: GameState = 'menu';
  private theme: ThemeType = 'volcano';
  private player: Player;
  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];
  private particles: Particle[] = [];
  private backgroundLayers: { x: number; speed: number }[] = [];

  private stats: GameStats = { distance: 0, coins: 0, speed: 0 };
  private animationId: number | null = null;
  private lastTime: number = 0;
  private obstacleIdCounter: number = 0;
  private coinIdCounter: number = 0;
  private lastObstacleX: number = 0;
  private skin: Skin | null = null;

  private shakeAmount: number = 0;
  private shakeDecay: number = 0.9;

  private onStatsUpdate?: (stats: GameStats) => void;
  private onGameOver?: (stats: GameStats) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.groundY = this.height - defaultConfig.groundHeight;

    this.player = this.createPlayer();
    this.initBackgroundLayers();
  }

  private createPlayer(): Player {
    return {
      x: defaultConfig.playerX,
      y: this.groundY - 60,
      width: 40,
      height: 60,
      velocityY: 0,
      state: 'running',
      skin: 'default',
      isOnGround: true,
      slideTimer: 0,
    };
  }

  private initBackgroundLayers() {
    this.backgroundLayers = [
      { x: 0, speed: 0.2 },
      { x: 0, speed: 0.5 },
      { x: 0, speed: 0.8 },
    ];
  }

  public setTheme(theme: ThemeType) {
    this.theme = theme;
  }

  public setSkin(skin: Skin) {
    this.skin = skin;
    this.player.skin = skin.id;
  }

  public setOnStatsUpdate(callback: (stats: GameStats) => void) {
    this.onStatsUpdate = callback;
  }

  public setOnGameOver(callback: (stats: GameStats) => void) {
    this.onGameOver = callback;
  }

  public start() {
    this.reset();
    this.gameState = 'playing';
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public pause() {
    this.gameState = 'paused';
  }

  public resume() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  public stop() {
    this.gameState = 'menu';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public reset() {
    this.player = this.createPlayer();
    this.obstacles = [];
    this.coins = [];
    this.particles = [];
    this.stats = { distance: 0, coins: 0, speed: defaultConfig.baseSpeed };
    this.obstacleIdCounter = 0;
    this.coinIdCounter = 0;
    this.lastObstacleX = this.width;
    this.shakeAmount = 0;
    this.initBackgroundLayers();
  }

  public getState(): GameState {
    return this.gameState;
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public jump() {
    if (this.gameState !== 'playing') return;
    if (this.player.isOnGround && this.player.state !== 'sliding') {
      this.player.velocityY = defaultConfig.jumpForce;
      this.player.state = 'jumping';
      this.player.isOnGround = false;
      this.spawnJumpParticles();
    }
  }

  public slide() {
    if (this.gameState !== 'playing') return;
    if (this.player.isOnGround && this.player.state !== 'sliding') {
      this.player.state = 'sliding';
      this.player.slideTimer = 500;
      this.player.height = 30;
      this.player.y = this.groundY - 30;
      this.spawnSlideParticles();
    }
  }

  private gameLoop = () => {
    if (this.gameState !== 'playing') return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number) {
    const difficultyMultiplier = themeDifficulty[this.theme];
    this.stats.speed = Math.min(
      20,
      (defaultConfig.baseSpeed + this.stats.distance * defaultConfig.speedIncrement) * difficultyMultiplier
    );

    this.stats.distance += this.stats.speed * 0.1;
    this.updatePlayer(deltaTime);
    this.updateObstacles();
    this.updateCoins();
    this.updateParticles();
    this.updateBackground();
    this.spawnObstacles();
    this.spawnCoins();
    this.checkCollisions();
    this.updateShake();

    this.onStatsUpdate?.(this.getStats());
  }

  private updatePlayer(deltaTime: number) {
    this.player.velocityY += defaultConfig.gravity;
    this.player.y += this.player.velocityY;

    if (this.player.state === 'sliding') {
      this.player.slideTimer -= deltaTime;
      if (this.player.slideTimer <= 0) {
        this.player.state = 'running';
        this.player.height = 60;
        this.player.y = this.groundY - 60;
      }
    }

    if (this.player.y + this.player.height >= this.groundY) {
      this.player.y = this.groundY - this.player.height;
      this.player.velocityY = 0;
      this.player.isOnGround = true;
      if (this.player.state === 'jumping') {
        this.player.state = 'running';
      }
    }

    if (this.player.state === 'running' && this.player.isOnGround) {
      if (Math.random() < 0.3) {
        this.spawnRunParticle();
      }
    }
  }

  private updateObstacles() {
    const speed = this.stats.speed;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= speed;

      if (obs.type === 'platform' && obs.platformDirection !== undefined) {
        obs.y += obs.platformDirection * 1.5;
        if (obs.y < this.groundY - 150 || obs.y > this.groundY - 80) {
          obs.platformDirection *= -1;
        }
      }

      if (obs.type === 'blade') {
        obs.rotation = (obs.rotation || 0) + 0.2;
      }

      if (obs.x + obs.width < 0) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private updateCoins() {
    const speed = this.stats.speed;

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.x -= speed;
      coin.animationFrame = (coin.animationFrame + 0.2) % (Math.PI * 2);

      if (coin.x + 20 < 0 || coin.collected) {
        this.coins.splice(i, 1);
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateBackground() {
    const speed = this.stats.speed;
    this.backgroundLayers.forEach((layer) => {
      layer.x -= speed * layer.speed;
      if (layer.x <= -this.width) {
        layer.x = 0;
      }
    });
  }

  private updateShake() {
    if (this.shakeAmount > 0) {
      this.shakeAmount *= this.shakeDecay;
      if (this.shakeAmount < 0.5) {
        this.shakeAmount = 0;
      }
    }
  }

  private spawnObstacles() {
    const minGap = 250 + this.stats.speed * 20;
    const maxGap = 500 + this.stats.speed * 30;

    if (this.lastObstacleX - this.stats.speed < this.width - minGap) {
      const gap = minGap + Math.random() * (maxGap - minGap);
      this.lastObstacleX = this.width + gap;

      const types: ObstacleType[] = ['pit', 'high', 'platform', 'blade'];
      const type = types[Math.floor(Math.random() * types.length)];

      this.createObstacle(type);
    }
  }

  private createObstacle(type: ObstacleType) {
    const id = this.obstacleIdCounter++;
    let obstacle: Obstacle;

    switch (type) {
      case 'pit':
        obstacle = {
          id,
          type,
          x: this.lastObstacleX,
          y: this.groundY,
          width: 80 + Math.random() * 60,
          height: 100,
        };
        break;
      case 'high':
        obstacle = {
          id,
          type,
          x: this.lastObstacleX,
          y: this.groundY - 80,
          width: 50,
          height: 80,
        };
        break;
      case 'platform':
        obstacle = {
          id,
          type,
          x: this.lastObstacleX,
          y: this.groundY - 120,
          width: 100,
          height: 20,
          platformDirection: 1,
        };
        break;
      case 'blade':
        obstacle = {
          id,
          type,
          x: this.lastObstacleX,
          y: this.groundY - 60,
          width: 50,
          height: 50,
          rotation: 0,
        };
        break;
      default:
        return;
    }

    this.obstacles.push(obstacle);
  }

  private spawnCoins() {
    if (Math.random() < 0.02 && this.coins.length < 10) {
      const baseY = this.groundY - 50 - Math.random() * 100;
      const coinCount = 3 + Math.floor(Math.random() * 4);

      for (let i = 0; i < coinCount; i++) {
        this.coins.push({
          id: this.coinIdCounter++,
          x: this.width + i * 40,
          y: baseY + Math.sin(i * 0.5) * 20,
          collected: false,
          animationFrame: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  private checkCollisions() {
    const playerBox = {
      x: this.player.x + 5,
      y: this.player.y + 5,
      width: this.player.width - 10,
      height: this.player.height - 10,
    };

    for (const obs of this.obstacles) {
      if (obs.type === 'pit') {
        if (
          this.player.isOnGround &&
          playerBox.x + playerBox.width > obs.x &&
          playerBox.x < obs.x + obs.width
        ) {
          this.triggerGameOver();
          return;
        }
      } else if (obs.type === 'platform') {
        if (
          this.player.velocityY >= 0 &&
          playerBox.y + playerBox.height <= obs.y + 10 &&
          playerBox.y + playerBox.height >= obs.y - 10 &&
          playerBox.x + playerBox.width > obs.x &&
          playerBox.x < obs.x + obs.width
        ) {
          this.player.y = obs.y - this.player.height;
          this.player.velocityY = 0;
          this.player.isOnGround = true;
          if (this.player.state === 'jumping') {
            this.player.state = 'running';
          }
        }
      } else {
        if (this.rectIntersect(playerBox, obs)) {
          this.triggerGameOver();
          return;
        }
      }
    }

    for (const coin of this.coins) {
      if (!coin.collected) {
        const coinBox = { x: coin.x - 15, y: coin.y - 15, width: 30, height: 30 };
        if (this.rectIntersect(playerBox, coinBox)) {
          coin.collected = true;
          this.stats.coins++;
          this.spawnCoinParticles(coin.x, coin.y);
        }
      }
    }
  }

  private rectIntersect(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  private triggerGameOver() {
    this.gameState = 'gameover';
    this.shakeAmount = 20;
    this.spawnExplosionParticles();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.onGameOver?.(this.getStats());
  }

  private spawnJumpParticles() {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2,
        life: 30,
        maxLife: 30,
        color: themeColors[this.theme].particle,
        size: 4 + Math.random() * 4,
      });
    }
  }

  private spawnSlideParticles() {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x,
        y: this.groundY - 5,
        vx: -2 - Math.random() * 3,
        vy: -Math.random() * 2,
        life: 25,
        maxLife: 25,
        color: themeColors[this.theme].particle,
        size: 3 + Math.random() * 3,
      });
    }
  }

  private spawnRunParticle() {
    this.particles.push({
      x: this.player.x + 10,
      y: this.groundY - 5,
      vx: -1 - Math.random() * 2,
      vy: -Math.random(),
      life: 20,
      maxLife: 20,
      color: themeColors[this.theme].particle,
      size: 2 + Math.random() * 2,
    });
  }

  private spawnCoinParticles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 20,
        maxLife: 20,
        color: '#FFD700',
        size: 4,
      });
    }
  }

  private spawnExplosionParticles() {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 40,
        maxLife: 40,
        color: ['#FF4500', '#FF6347', '#FFD700'][Math.floor(Math.random() * 3)],
        size: 5 + Math.random() * 5,
      });
    }
  }

  private render() {
    const ctx = this.ctx;
    const colors = themeColors[this.theme];

    ctx.save();

    if (this.shakeAmount > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.shakeAmount,
        (Math.random() - 0.5) * this.shakeAmount
      );
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, colors.skyTop);
    gradient.addColorStop(1, colors.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    this.renderBackgroundDecorations();
    this.renderGround(colors);
    this.renderObstacles(colors);
    this.renderCoins();
    this.renderPlayer();
    this.renderParticles();

    ctx.restore();
  }

  private renderBackgroundDecorations() {
    const ctx = this.ctx;

    if (this.theme === 'space') {
      for (let i = 0; i < 50; i++) {
        const x = ((i * 137 + this.backgroundLayers[0].x * 0.1) % (this.width + 100)) - 50;
        const y = (i * 73) % (this.height - 200);
        const size = (i % 3) + 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (i % 5) * 0.15})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.theme === 'snow') {
      for (let i = 0; i < 30; i++) {
        const x = ((i * 97 + this.backgroundLayers[0].x * 0.3) % (this.width + 100)) - 50;
        const y = ((i * 53 + this.stats.distance * 0.5) % (this.height - 150));
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.theme === 'volcano') {
      for (let i = 0; i < 15; i++) {
        const x = ((i * 157 + this.backgroundLayers[0].x * 0.2) % (this.width + 200)) - 100;
        const y = 100 + (i * 31) % 150;
        ctx.fillStyle = `rgba(255, ${100 + i * 10}, 0, 0.3)`;
        ctx.beginPath();
        ctx.arc(x, y, 20 + i % 3 * 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderGround(colors: typeof themeColors[ThemeType]) {
    const ctx = this.ctx;

    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    ctx.fillStyle = colors.groundDark;
    ctx.fillRect(0, this.groundY, this.width, 10);

    ctx.fillStyle = colors.accent;
    for (let i = 0; i < this.width; i += 50) {
      const x = ((i - this.backgroundLayers[2].x) % (this.width + 50)) - 25;
      ctx.fillRect(x, this.groundY + 15, 30, 3);
    }
  }

  private renderObstacles(colors: typeof themeColors[ThemeType]) {
    const ctx = this.ctx;

    for (const obs of this.obstacles) {
      ctx.save();

      switch (obs.type) {
        case 'pit':
          ctx.fillStyle = '#000';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = colors.groundDark;
          ctx.fillRect(obs.x, obs.y, obs.width, 5);
          break;

        case 'high':
          ctx.fillStyle = colors.accent;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = colors.groundDark;
          ctx.fillRect(obs.x, obs.y, obs.width, 8);
          ctx.fillRect(obs.x, obs.y + obs.height - 8, obs.width, 8);
          break;

        case 'platform':
          ctx.fillStyle = colors.accent;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = colors.ground;
          ctx.fillRect(obs.x, obs.y, obs.width, 5);
          break;

        case 'blade':
          ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
          ctx.rotate(obs.rotation || 0);
          ctx.fillStyle = '#C0C0C0';
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-8, -obs.height / 2);
            ctx.lineTo(8, -obs.height / 2);
            ctx.closePath();
            ctx.fill();
          }
          ctx.fillStyle = '#666';
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();
    }
  }

  private renderCoins() {
    const ctx = this.ctx;

    for (const coin of this.coins) {
      if (coin.collected) continue;

      const scale = 0.7 + Math.abs(Math.sin(coin.animationFrame)) * 0.3;

      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.scale(scale, 1);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
      gradient.addColorStop(0, '#FFF176');
      gradient.addColorStop(0.5, '#FFD700');
      gradient.addColorStop(1, '#FFA000');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#B8860B';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0);

      ctx.restore();
    }
  }

  private renderPlayer() {
    const ctx = this.ctx;
    const p = this.player;
    const skinColors = this.skin?.colors || { body: '#3B82F6', accent: '#60A5FA' };

    ctx.save();

    if (p.state === 'sliding') {
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      ctx.rotate(-0.3);
      ctx.translate(-(p.x + p.width / 2), -(p.y + p.height / 2));
    }

    ctx.fillStyle = skinColors.body;
    ctx.fillRect(p.x + 5, p.y + 15, p.width - 10, p.height - 20);

    ctx.fillStyle = skinColors.accent;
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2, p.y + 12, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2 - 4, p.y + 10, 4, 0, Math.PI * 2);
    ctx.arc(p.x + p.width / 2 + 4, p.y + 10, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2 - 3, p.y + 10, 2, 0, Math.PI * 2);
    ctx.arc(p.x + p.width / 2 + 5, p.y + 10, 2, 0, Math.PI * 2);
    ctx.fill();

    if (p.state === 'running' && p.isOnGround) {
      const legOffset = Math.sin(Date.now() * 0.02) * 8;
      ctx.fillStyle = skinColors.body;
      ctx.fillRect(p.x + 8, p.y + p.height - 10, 8, 10 + legOffset);
      ctx.fillRect(p.x + p.width - 16, p.y + p.height - 10, 8, 10 - legOffset);
    } else if (p.state === 'jumping') {
      ctx.fillStyle = skinColors.body;
      ctx.fillRect(p.x + 8, p.y + p.height - 8, 8, 8);
      ctx.fillRect(p.x + p.width - 16, p.y + p.height - 8, 8, 8);
    }

    ctx.restore();
  }

  private renderParticles() {
    const ctx = this.ctx;

    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.groundY = height - defaultConfig.groundHeight;
  }
}
