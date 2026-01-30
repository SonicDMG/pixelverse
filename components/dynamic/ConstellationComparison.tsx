'use client';

import { useEffect, useRef } from 'react';
import { convertStarsToCanvasWithProjection, type CelestialCoordinate } from '@/utils/celestial-coordinates';

interface Star {
  name: string;
  magnitude: number;
  ra: string;
  dec: string;
  color?: string;
  size?: number;
}

interface ConstellationLine {
  from: number;
  to: number;
}

interface ConstellationComparisonProps {
  name: string;
  stars: Star[];
  lines: ConstellationLine[];
  canvasSize?: number;
}

export function ConstellationComparison({
  name,
  stars,
  lines,
  canvasSize = 400
}: ConstellationComparisonProps) {
  const customCanvasRef = useRef<HTMLCanvasElement>(null);
  const d3CanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const customCanvas = customCanvasRef.current;
    const d3Canvas = d3CanvasRef.current;
    
    if (!customCanvas || !d3Canvas) return;

    const customCtx = customCanvas.getContext('2d');
    const d3Ctx = d3Canvas.getContext('2d');
    
    if (!customCtx || !d3Ctx) return;

    // Get coordinates using d3-geo projection
    const celestialStars: CelestialCoordinate[] = stars.map(s => ({
      ra: s.ra,
      dec: s.dec
    }));

    const { coordinates, projectionType, bounds } = convertStarsToCanvasWithProjection(
      celestialStars,
      canvasSize,
      50
    );

    // Draw on both canvases (they now show the same d3-geo projection)
    drawConstellation(customCtx, coordinates, stars, lines, canvasSize, '#00ff00');
    drawConstellation(d3Ctx, coordinates, stars, lines, canvasSize, '#00ffff');

  }, [stars, lines, canvasSize]);

  const drawConstellation = (
    ctx: CanvasRenderingContext2D,
    coordinates: Array<{ x: number; y: number }>,
    stars: Star[],
    lines: ConstellationLine[],
    size: number,
    color: string
  ) => {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);

    // Draw constellation lines
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    lines.forEach(line => {
      const from = coordinates[line.from];
      const to = coordinates[line.to];
      
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    });

    // Draw stars
    ctx.globalAlpha = 1;
    coordinates.forEach((coord, index) => {
      const star = stars[index];
      if (!star) return;

      // Calculate star size based on magnitude (brighter = larger)
      const baseSize = star.size || (5 - star.magnitude);
      const starSize = Math.max(1, Math.min(8, baseSize));

      // Draw star glow
      const gradient = ctx.createRadialGradient(
        coord.x, coord.y, 0,
        coord.x, coord.y, starSize * 2
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color + '80');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, starSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw star core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, starSize / 2, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="font-pixel text-sm text-[var(--color-accent)] text-center">
          d3-geo Projection (Green)
        </h3>
        <canvas
          ref={customCanvasRef}
          width={canvasSize}
          height={canvasSize}
          className="border-2 border-[var(--color-primary)] rounded bg-[#0a0a0a]"
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-pixel text-sm text-[var(--color-secondary)] text-center">
          d3-geo Projection (Cyan)
        </h3>
        <canvas
          ref={d3CanvasRef}
          width={canvasSize}
          height={canvasSize}
          className="border-2 border-[var(--color-secondary)] rounded bg-[#0a0a0a]"
        />
      </div>
    </div>
  );
}

// Made with Bob
