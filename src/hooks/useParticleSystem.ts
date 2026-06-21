import { useState, useEffect, useRef, useCallback } from 'react';
import { Particle, HourlyWindData } from '../types';
import { degToRad } from '../utils/windCalculator';

interface UseParticleSystemProps {
  windData: HourlyWindData;
  canvasWidth: number;
  canvasHeight: number;
  enabled?: boolean;
}

export const useParticleSystem = ({
  windData,
  canvasWidth,
  canvasHeight,
  enabled = true,
}: UseParticleSystemProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const createParticle = useCallback((): Particle => {
    const angle = degToRad(windData.windDirection + 180);
    const speed = windData.windSpeed * 0.15;
    
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;
    
    switch (side) {
      case 0:
        x = Math.random() * canvasWidth;
        y = -10;
        break;
      case 1:
        x = canvasWidth + 10;
        y = Math.random() * canvasHeight;
        break;
      case 2:
        x = Math.random() * canvasWidth;
        y = canvasHeight + 10;
        break;
      default:
        x = -10;
        y = Math.random() * canvasHeight;
    }

    const maxLife = 3000 + Math.random() * 2000;
    
    return {
      id: particleIdRef.current++,
      x,
      y,
      vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
      vy: Math.sin(angle) * speed * (0.8 + Math.random() * 0.4),
      life: maxLife,
      maxLife,
      opacity: 0.6 + Math.random() * 0.4,
    };
  }, [windData, canvasWidth, canvasHeight]);

  const updateParticles = useCallback(() => {
    setParticles((prev) => {
      const targetCount = Math.min(200, Math.max(50, windData.windSpeed * 15));
      
      let updated = prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 16,
        }))
        .filter(
          (p) =>
            p.life > 0 &&
            p.x > -50 &&
            p.x < canvasWidth + 50 &&
            p.y > -50 &&
            p.y < canvasHeight + 50
        );

      while (updated.length < targetCount && enabled) {
        updated.push(createParticle());
      }

      return updated;
    });
  }, [windData, canvasWidth, canvasHeight, enabled, createParticle]);

  useEffect(() => {
    if (!enabled) {
      setParticles([]);
      return;
    }

    const animate = () => {
      updateParticles();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, updateParticles]);

  useEffect(() => {
    setParticles([]);
    particleIdRef.current = 0;
  }, [windData.windDirection]);

  return {
    particles,
  };
};
