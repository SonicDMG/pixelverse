'use client';

import { useEffect, useRef, useState } from 'react';
import { COLORS } from '@/constants/theme';

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  width?: number;
  height?: number;
}

/**
 * AudioVisualizer component
 * Displays a real-time frequency visualization of the audio output
 * Uses Web Audio API AnalyserNode to get frequency data
 * Renders cyberpunk-themed frequency bars
 */
export default function AudioVisualizer({
  analyserNode,
  isPlaying,
  width,
  height = 40,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [canvasWidth, setCanvasWidth] = useState(width || 240);

  // Measure container width on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const rect = container.getBoundingClientRect();
      setCanvasWidth(width || rect.width);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas initially
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvasWidth, height);

    if (!analyserNode || !isPlaying) {
      // Draw inactive state - flat line
      ctx.strokeStyle = COLORS.neonCyan + '40'; // 25% opacity
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(canvasWidth, height / 2);
      ctx.stroke();
      
      // Add "INACTIVE" text
      ctx.fillStyle = COLORS.neonCyan + '60';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('INACTIVE', canvasWidth / 2, height / 2 + 3);
      
      return;
    }

    // Set up frequency data array
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Number of bars to display (use fewer for cleaner look)
    const barCount = 16;
    const barWidth = canvasWidth / barCount;
    const barGap = 1;

    const draw = (): void => {
      if (!isPlaying || !analyserNode || !ctx) {
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);

      // Get frequency data
      analyserNode.getByteFrequencyData(dataArray);

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvasWidth, height);

      // Draw frequency bars
      for (let i = 0; i < barCount; i++) {
        // Sample frequency data (focus on lower-mid frequencies for music)
        const dataIndex = Math.floor((i / barCount) * (bufferLength * 0.6));
        const value = dataArray[dataIndex];
        
        // Normalize to 0-1 range
        const normalizedValue = value / 255;
        
        // Calculate bar height with minimum height for visual appeal
        const minHeight = 2;
        const barHeight = Math.max(minHeight, normalizedValue * height);
        
        // Calculate x position
        const x = i * barWidth;
        
        // Create gradient for cyberpunk effect
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        
        // Color based on frequency intensity
        if (normalizedValue > 0.7) {
          gradient.addColorStop(0, COLORS.neonMagenta);
          gradient.addColorStop(1, COLORS.neonCyan);
        } else if (normalizedValue > 0.4) {
          gradient.addColorStop(0, COLORS.neonCyan);
          gradient.addColorStop(1, COLORS.neonBlue);
        } else {
          gradient.addColorStop(0, COLORS.neonCyan + 'CC');
          gradient.addColorStop(1, COLORS.neonCyan + '66');
        }
        
        ctx.fillStyle = gradient;
        
        // Draw bar from bottom up
        ctx.fillRect(
          x + barGap / 2,
          height - barHeight,
          barWidth - barGap,
          barHeight
        );
        
        // Add glow effect for higher values
        if (normalizedValue > 0.5) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = normalizedValue > 0.7 ? COLORS.neonMagenta : COLORS.neonCyan;
          ctx.fillRect(
            x + barGap / 2,
            height - barHeight,
            barWidth - barGap,
            barHeight
          );
          ctx.shadowBlur = 0;
        }
      }
    };

    // Start animation loop
    draw();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isPlaying, canvasWidth, height]);

  return (
    <div ref={containerRef} className="flex items-center w-full">
      <canvas
        ref={canvasRef}
        style={{ width: `${canvasWidth}px`, height: `${height}px` }}
      />
    </div>
  );
}

// Made with Bob