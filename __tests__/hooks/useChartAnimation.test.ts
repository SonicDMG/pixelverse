import { renderHook, act, waitFor } from '@testing-library/react';
import { useChartAnimation } from '@/hooks/useChartAnimation';

describe('useChartAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should return 0 initially when enabled', () => {
      const { result } = renderHook(() => useChartAnimation(10));
      
      expect(result.current).toBe(0);
    });

    it('should return 1 immediately when disabled', () => {
      const { result } = renderHook(() => 
        useChartAnimation(10, { enabled: false })
      );
      
      expect(result.current).toBe(1);
    });

    it('should return 1 immediately when dataLength is 0', () => {
      const { result } = renderHook(() => useChartAnimation(0));
      
      expect(result.current).toBe(1);
    });

    it('should animate from 0 to 1 over the duration', async () => {
      const duration = 1500;
      const { result } = renderHook(() => 
        useChartAnimation(10, { duration })
      );

      expect(result.current).toBe(0);

      // Advance time by 25% of duration
      act(() => {
        jest.advanceTimersByTime(duration * 0.25);
      });

      await waitFor(() => {
        expect(result.current).toBeGreaterThan(0);
        expect(result.current).toBeLessThan(0.5);
      });

      // Advance time by another 25% (50% total)
      act(() => {
        jest.advanceTimersByTime(duration * 0.25);
      });

      await waitFor(() => {
        expect(result.current).toBeGreaterThan(0.25);
        expect(result.current).toBeLessThan(0.75);
      });

      // Advance to completion
      act(() => {
        jest.advanceTimersByTime(duration * 0.5);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });
  });

  describe('duration handling', () => {
    it('should use default duration of 1500ms', async () => {
      const { result } = renderHook(() => useChartAnimation(10));

      expect(result.current).toBe(0);

      // Advance by default duration
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });

    it('should respect custom duration', async () => {
      const customDuration = 3000;
      const { result } = renderHook(() => 
        useChartAnimation(10, { duration: customDuration })
      );

      expect(result.current).toBe(0);

      // Halfway through custom duration
      act(() => {
        jest.advanceTimersByTime(customDuration / 2);
      });

      await waitFor(() => {
        expect(result.current).toBeGreaterThan(0.4);
        expect(result.current).toBeLessThan(0.6);
      });

      // Complete custom duration
      act(() => {
        jest.advanceTimersByTime(customDuration / 2);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });

    it('should handle very short durations', async () => {
      const { result } = renderHook(() => 
        useChartAnimation(10, { duration: 100 })
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });

    it('should handle very long durations', async () => {
      const { result } = renderHook(() => 
        useChartAnimation(10, { duration: 10000 })
      );

      // After 1 second, should still be animating
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current).toBeGreaterThan(0);
        expect(result.current).toBeLessThan(0.2);
      });

      // Complete the animation
      act(() => {
        jest.advanceTimersByTime(9000);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });
  });

  describe('enabled/disabled states', () => {
    it('should not animate when enabled is false', () => {
      const { result } = renderHook(() => 
        useChartAnimation(10, { enabled: false })
      );

      expect(result.current).toBe(1);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current).toBe(1);
    });

    it('should switch from disabled to enabled', async () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useChartAnimation(10, { enabled }),
        { initialProps: { enabled: false } }
      );

      expect(result.current).toBe(1);

      // Enable animation - this triggers useEffect which schedules requestAnimationFrame
      act(() => {
        rerender({ enabled: true });
      });

      // Wait for the animation to start (first frame sets progress based on elapsed time)
      await waitFor(() => {
        expect(result.current).toBeGreaterThanOrEqual(0);
        expect(result.current).toBeLessThan(1);
      });

      // Advance time to complete animation
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });

    it('should switch from enabled to disabled', async () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useChartAnimation(10, { enabled }),
        { initialProps: { enabled: true } }
      );

      expect(result.current).toBe(0);

      // Advance animation partway
      act(() => {
        jest.advanceTimersByTime(750);
      });

      await waitFor(() => {
        expect(result.current).toBeGreaterThan(0);
        expect(result.current).toBeLessThan(1);
      });

      // Disable animation
      rerender({ enabled: false });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });
  });

  describe('dataLength changes', () => {
    it('should restart animation when dataLength changes', async () => {
      const { result, rerender } = renderHook(
        ({ length }) => useChartAnimation(length),
        { initialProps: { length: 5 } }
      );

      // Advance animation partway
      act(() => {
        jest.advanceTimersByTime(750);
      });

      await waitFor(() => {
        expect(result.current).toBeGreaterThan(0);
        expect(result.current).toBeLessThan(1);
      });

      const progressBeforeChange = result.current;

      // Change dataLength - this triggers useEffect which restarts animation
      act(() => {
        rerender({ length: 10 });
      });

      // After rerender, animation restarts from 0
      // The first frame will set progress based on elapsed time from new startTime
      await waitFor(() => {
        expect(result.current).toBeLessThan(progressBeforeChange);
      });

      // Animation should complete after full duration
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });

    it('should handle dataLength changing to 0', async () => {
      const { result, rerender } = renderHook(
        ({ length }) => useChartAnimation(length),
        { initialProps: { length: 10 } }
      );

      expect(result.current).toBe(0);

      // Change to 0
      rerender({ length: 0 });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });

    it('should handle dataLength changing from 0 to positive', async () => {
      const { result, rerender } = renderHook(
        ({ length }) => useChartAnimation(length),
        { initialProps: { length: 0 } }
      );

      expect(result.current).toBe(1);

      // Change to positive - this starts animation
      act(() => {
        rerender({ length: 10 });
      });

      // Animation starts, first frame will show progress > 0
      await waitFor(() => {
        expect(result.current).toBeGreaterThanOrEqual(0);
        expect(result.current).toBeLessThan(1);
      });

      // Complete the animation
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });
  });

  describe('cleanup on unmount', () => {
    it('should cancel animation frame on unmount', async () => {
      const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
      
      const { unmount } = renderHook(() => useChartAnimation(10));

      // Start animation
      act(() => {
        jest.advanceTimersByTime(500);
      });

      unmount();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
      
      cancelAnimationFrameSpy.mockRestore();
    });

    it('should not cause errors when unmounted mid-animation', async () => {
      const { result, unmount } = renderHook(() => useChartAnimation(10));

      expect(result.current).toBe(0);

      // Advance animation partway
      act(() => {
        jest.advanceTimersByTime(750);
      });

      // Unmount while animating
      expect(() => unmount()).not.toThrow();
    });

    it('should cleanup properly on multiple mount/unmount cycles', () => {
      const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');

      // First mount
      const { unmount: unmount1 } = renderHook(() => useChartAnimation(10));
      act(() => {
        jest.advanceTimersByTime(500);
      });
      unmount1();

      // Second mount
      const { unmount: unmount2 } = renderHook(() => useChartAnimation(10));
      act(() => {
        jest.advanceTimersByTime(500);
      });
      unmount2();

      // Third mount
      const { unmount: unmount3 } = renderHook(() => useChartAnimation(10));
      act(() => {
        jest.advanceTimersByTime(500);
      });
      unmount3();

      expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(3);
      
      cancelAnimationFrameSpy.mockRestore();
    });
  });

  describe('animation progress calculation', () => {
    it('should never exceed 1.0', async () => {
      const { result } = renderHook(() => useChartAnimation(10, { duration: 1000 }));

      // Advance way past the duration
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
        expect(result.current).toBeLessThanOrEqual(1);
      });
    });

    it('should progress smoothly', async () => {
      const { result } = renderHook(() => useChartAnimation(10, { duration: 1000 }));

      const progressValues: number[] = [];

      // Sample progress at intervals
      for (let i = 0; i <= 10; i++) {
        act(() => {
          jest.advanceTimersByTime(100);
        });
        await waitFor(() => {
          progressValues.push(result.current);
        });
      }

      // Check that progress is monotonically increasing
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
      }

      // Check that final value is 1
      expect(progressValues[progressValues.length - 1]).toBe(1);
    });

    it('should calculate correct progress at specific time points', async () => {
      const duration = 2000;
      const { result } = renderHook(() => useChartAnimation(10, { duration }));

      // At 0ms: 0%
      expect(result.current).toBe(0);

      // At 500ms: ~25%
      act(() => {
        jest.advanceTimersByTime(500);
      });
      await waitFor(() => {
        expect(result.current).toBeCloseTo(0.25, 1);
      });

      // At 1000ms: ~50%
      act(() => {
        jest.advanceTimersByTime(500);
      });
      await waitFor(() => {
        expect(result.current).toBeCloseTo(0.5, 1);
      });

      // At 1500ms: ~75%
      act(() => {
        jest.advanceTimersByTime(500);
      });
      await waitFor(() => {
        expect(result.current).toBeCloseTo(0.75, 1);
      });

      // At 2000ms: 100%
      act(() => {
        jest.advanceTimersByTime(500);
      });
      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle negative dataLength gracefully', () => {
      const { result } = renderHook(() => useChartAnimation(-5));
      
      // Should treat as 0 or handle gracefully
      expect(result.current).toBeGreaterThanOrEqual(0);
      expect(result.current).toBeLessThanOrEqual(1);
    });

    it('should handle zero duration', async () => {
      const { result } = renderHook(() => 
        useChartAnimation(10, { duration: 0 })
      );

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });

    it('should handle rapid re-renders', async () => {
      const { result, rerender } = renderHook(() => useChartAnimation(10));

      // Rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender();
      }

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });

    it('should handle options changing mid-animation', async () => {
      const { result, rerender } = renderHook(
        ({ duration }) => useChartAnimation(10, { duration }),
        { initialProps: { duration: 2000 } }
      );

      // Start animation
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result.current).toBeGreaterThan(0);
      });

      const progressBeforeChange = result.current;

      // Change duration mid-animation - this restarts the animation
      act(() => {
        rerender({ duration: 1000 });
      });

      // Animation restarts with new duration
      await waitFor(() => {
        expect(result.current).toBeLessThan(progressBeforeChange);
      });

      // Complete animation with new duration
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });
  });
});

// Made with Bob