import { useEffect, useRef } from 'react';
import { useAssignmentStore, getUrgencyScore, isUrgent } from '@/store/useAssignmentStore';

interface RadarPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  urgent: boolean;
  label: string;
  assignmentId: string;
  pulseSpeed: 'slow' | 'fast';
}

export default function RadarChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { courses, assignments } = useAssignmentStore();

  const getCourseColor = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.color || '#00f5d4';
  };

  const getRadarPoints = (cx: number, cy: number, radius: number): RadarPoint[] => {
    const activeAssignments = assignments.filter((a) => a.status !== 'completed');
    if (activeAssignments.length === 0) return [];

    const courseIds = [...new Set(activeAssignments.map((a) => a.courseId))];
    const anglePerCourse = (2 * Math.PI) / Math.max(courseIds.length, 1);

    return activeAssignments.map((a, i) => {
      const courseIdx = courseIds.indexOf(a.courseId);
      const baseAngle = courseIdx * anglePerCourse - Math.PI / 2;
      const assignmentsInCourse = activeAssignments.filter(
        (aa) => aa.courseId === a.courseId
      );
      const idxInCourse = assignmentsInCourse.indexOf(a);
      const angleOffset =
        assignmentsInCourse.length > 1
          ? (idxInCourse / (assignmentsInCourse.length - 1) - 0.5) * anglePerCourse * 0.6
          : 0;
      const angle = baseAngle + angleOffset;

      const urgency = getUrgencyScore(a.deadline, a.progress);
      const dist = radius * (1 - urgency) * 0.85 + radius * 0.05;
      const size = Math.max(4, Math.min(12, a.estimatedHours * 1.5 + 4));
      const urgent = isUrgent(a.deadline, a.progress);

      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        color: getCourseColor(a.courseId),
        size,
        urgent,
        label: a.title,
        assignmentId: a.id,
        pulseSpeed: urgent ? 'fast' : 'slow',
      };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 30;
    let scanAngle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 1; i <= 4; i++) {
        const r = (radius * i) / 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(0, 245, 212, ${0.08 + i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, scanAngle - 0.6, scanAngle);
      ctx.closePath();
      const scanGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      scanGrad.addColorStop(0, 'rgba(0, 245, 212, 0.15)');
      scanGrad.addColorStop(1, 'rgba(0, 245, 212, 0.02)');
      ctx.fillStyle = scanGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(scanAngle) * radius,
        cy + Math.sin(scanAngle) * radius
      );
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const points = getRadarPoints(cx, cy, radius);
      const time = Date.now() / 1000;

      points.forEach((p) => {
        const pulseFactor =
          p.pulseSpeed === 'fast'
            ? 0.4 + 0.6 * Math.abs(Math.sin(time * 4))
            : 0.6 + 0.4 * Math.abs(Math.sin(time * 1.5));

        if (p.urgent) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + 8, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(255, 71, 87, ${0.15 * pulseFactor})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + 3, 0, 2 * Math.PI);
        const glowColor = p.urgent ? '255, 71, 87' : hexToRgb(p.color);
        ctx.fillStyle = `rgba(${glowColor}, ${0.2 * pulseFactor})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7 + 0.3 * pulseFactor;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#00f5d4';
      ctx.fill();

      scanAngle += 0.015;
      if (scanAngle > 2 * Math.PI) scanAngle -= 2 * Math.PI;

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [courses, assignments]);

  function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '0, 245, 212';
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
