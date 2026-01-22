/**
 * Custom hook for progressive chart drawing animation
 * Eliminates duplication between chart components
 */

import { useState, useEffect } from 'react';

interface UseChartAnimationOptions {
  duration?: number;
  enabled?: boolean;
}

/**
 * Hook that provides progressive animation progress for chart drawing
 * @param dataLength - Length of the data array to animate
 * @param options - Animation configuration
 * @returns Animation progress (0 to 1)
 */
export function useChartAnimation(
  dataLength: number,
  options: UseChartAnimationOptions = {}
): number {
  const { duration = 1500, enabled = true } = options;
  const [animationProgress, setAnimationProgress] = useState(enabled ? 0 : 1);

  useEffect(() => {
    if (!enabled || dataLength === 0) {
      setAnimationProgress(1);
      return;
    }

    let animationId: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimationProgress(progress);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    // Cleanup function to cancel animation on unmount
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [dataLength, duration, enabled]);

  return animationProgress;
}

// Made with Bob