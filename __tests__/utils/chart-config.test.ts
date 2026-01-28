/**
 * Unit tests for chart configuration utilities
 * Tests getBaseChartOptions() and getDatasetConfig() functions
 */

import { getBaseChartOptions, getDatasetConfig, CHART_COLORS, PIXEL_FONT } from '@/utils/chart-config';

describe('chart-config utilities', () => {
  describe('CHART_COLORS constant', () => {
    it('should export an array of 4 cyberpunk colors', () => {
      expect(CHART_COLORS).toHaveLength(4);
      expect(CHART_COLORS).toEqual(['#00ff9f', '#ff00ff', '#00d4ff', '#ffff00']);
    });

    it('should be a readonly array', () => {
      expect(Object.isFrozen(CHART_COLORS)).toBe(false); // TypeScript const assertion, not runtime frozen
      expect(Array.isArray(CHART_COLORS)).toBe(true);
    });
  });

  describe('PIXEL_FONT constant', () => {
    it('should export the correct pixel font family', () => {
      expect(PIXEL_FONT).toBe("'Press Start 2P', monospace");
    });
  });

  describe('getBaseChartOptions()', () => {
    let options: ReturnType<typeof getBaseChartOptions>;

    beforeEach(() => {
      options = getBaseChartOptions();
    });

    it('should return a valid chart options object', () => {
      expect(options).toBeDefined();
      expect(typeof options).toBe('object');
    });

    it('should configure responsive behavior correctly', () => {
      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
    });

    it('should disable default animations', () => {
      expect(options.animation).toBeDefined();
      expect(options.animation.duration).toBe(0);
    });

    describe('legend configuration', () => {
      it('should enable legend display', () => {
        expect(options.plugins.legend.display).toBe(true);
      });

      it('should position legend at top', () => {
        expect(options.plugins.legend.position).toBe('top');
      });

      it('should use cyberpunk color for legend labels', () => {
        expect(options.plugins.legend.labels.color).toBe('#00ff9f');
      });

      it('should use pixel font for legend', () => {
        expect(options.plugins.legend.labels.font.family).toBe(PIXEL_FONT);
        expect(options.plugins.legend.labels.font.size).toBe(10);
      });

      it('should have appropriate padding', () => {
        expect(options.plugins.legend.labels.padding).toBe(20);
      });
    });

    describe('tooltip configuration', () => {
      it('should use cyberpunk color scheme', () => {
        expect(options.plugins.tooltip.backgroundColor).toBe('#0a0e27');
        expect(options.plugins.tooltip.titleColor).toBe('#00ff9f');
        expect(options.plugins.tooltip.bodyColor).toBe('#ffffff');
        expect(options.plugins.tooltip.borderColor).toBe('#00ff9f');
      });

      it('should have visible border', () => {
        expect(options.plugins.tooltip.borderWidth).toBe(2);
      });

      it('should have appropriate padding', () => {
        expect(options.plugins.tooltip.padding).toBe(12);
      });

      it('should display colors', () => {
        expect(options.plugins.tooltip.displayColors).toBe(true);
      });

      it('should use pixel font with correct sizes', () => {
        expect(options.plugins.tooltip.titleFont.family).toBe(PIXEL_FONT);
        expect(options.plugins.tooltip.titleFont.size).toBe(10);
        expect(options.plugins.tooltip.bodyFont.family).toBe(PIXEL_FONT);
        expect(options.plugins.tooltip.bodyFont.size).toBe(8);
      });
    });

    describe('x-axis configuration', () => {
      it('should configure grid with cyberpunk styling', () => {
        expect(options.scales.x.grid.color).toBe('rgba(0, 255, 159, 0.1)');
        expect(options.scales.x.grid.lineWidth).toBe(1);
      });

      it('should configure ticks with cyberpunk color', () => {
        expect(options.scales.x.ticks.color).toBe('#00ff9f');
      });

      it('should use pixel font for ticks', () => {
        expect(options.scales.x.ticks.font.family).toBe(PIXEL_FONT);
        expect(options.scales.x.ticks.font.size).toBe(8);
      });

      it('should rotate tick labels at 45 degrees', () => {
        expect(options.scales.x.ticks.maxRotation).toBe(45);
        expect(options.scales.x.ticks.minRotation).toBe(45);
      });
    });

    describe('y-axis configuration', () => {
      it('should configure grid with cyberpunk styling', () => {
        expect(options.scales.y.grid.color).toBe('rgba(0, 255, 159, 0.1)');
        expect(options.scales.y.grid.lineWidth).toBe(1);
      });

      it('should configure ticks with cyberpunk color', () => {
        expect(options.scales.y.ticks.color).toBe('#00ff9f');
      });

      it('should use pixel font for ticks', () => {
        expect(options.scales.y.ticks.font.family).toBe(PIXEL_FONT);
        expect(options.scales.y.ticks.font.size).toBe(8);
      });

      it('should format tick values as currency', () => {
        const callback = options.scales.y.ticks.callback;
        expect(callback).toBeDefined();
        expect(typeof callback).toBe('function');
        
        // Test the callback function
        expect(callback(100)).toBe('$100.00');
        expect(callback(50.5)).toBe('$50.50');
        expect(callback(0)).toBe('$0.00');
        expect(callback(1234.567)).toBe('$1234.57');
      });
    });

    it('should return a new object on each call (not cached)', () => {
      const options1 = getBaseChartOptions();
      const options2 = getBaseChartOptions();
      expect(options1).not.toBe(options2);
      // Deep equality check excluding functions
      expect(JSON.stringify(options1, (key, val) => typeof val === 'function' ? undefined : val))
        .toEqual(JSON.stringify(options2, (key, val) => typeof val === 'function' ? undefined : val));
    });
  });

  describe('getDatasetConfig()', () => {
    it('should create dataset config with required parameters', () => {
      const config = getDatasetConfig('Test Label', [1, 2, 3], '#00ff9f');
      
      expect(config.label).toBe('Test Label');
      expect(config.data).toEqual([1, 2, 3]);
      expect(config.borderColor).toBe('#00ff9f');
    });

    it('should apply fill by default', () => {
      const config = getDatasetConfig('Test', [1, 2, 3], '#00ff9f');
      
      expect(config.fill).toBe(true);
      expect(config.backgroundColor).toBe('#00ff9f20');
    });

    it('should support disabling fill', () => {
      const config = getDatasetConfig('Test', [1, 2, 3], '#00ff9f', false);
      
      expect(config.fill).toBe(false);
      expect(config.backgroundColor).toBe('transparent');
    });

    it('should configure border styling for pixel art', () => {
      const config = getDatasetConfig('Test', [1, 2, 3], '#ff00ff');
      
      expect(config.borderWidth).toBe(3);
      expect(config.tension).toBe(0); // No curve for pixel art
    });

    it('should configure point styling', () => {
      const config = getDatasetConfig('Test', [1, 2, 3], '#00d4ff');
      
      expect(config.pointRadius).toBe(6);
      expect(config.pointHoverRadius).toBe(8);
      expect(config.pointBackgroundColor).toBe('#00d4ff');
      expect(config.pointBorderColor).toBe('#0a0e27');
      expect(config.pointBorderWidth).toBe(2);
    });

    it('should handle different colors correctly', () => {
      const colors = ['#00ff9f', '#ff00ff', '#00d4ff', '#ffff00'];
      
      colors.forEach(color => {
        const config = getDatasetConfig('Test', [1, 2, 3], color);
        expect(config.borderColor).toBe(color);
        expect(config.pointBackgroundColor).toBe(color);
        expect(config.backgroundColor).toBe(`${color}20`);
      });
    });

    it('should handle empty data array', () => {
      const config = getDatasetConfig('Empty', [], '#00ff9f');
      
      expect(config.data).toEqual([]);
      expect(config.label).toBe('Empty');
    });

    it('should handle large data arrays', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => i);
      const config = getDatasetConfig('Large', largeData, '#00ff9f');
      
      expect(config.data).toHaveLength(1000);
      expect(config.data).toEqual(largeData);
    });

    it('should handle negative values', () => {
      const config = getDatasetConfig('Negative', [-10, -20, -30], '#00ff9f');
      
      expect(config.data).toEqual([-10, -20, -30]);
    });

    it('should handle decimal values', () => {
      const config = getDatasetConfig('Decimal', [1.5, 2.7, 3.9], '#00ff9f');
      
      expect(config.data).toEqual([1.5, 2.7, 3.9]);
    });

    it('should create independent config objects', () => {
      const config1 = getDatasetConfig('Test1', [1, 2, 3], '#00ff9f');
      const config2 = getDatasetConfig('Test2', [4, 5, 6], '#ff00ff');
      
      expect(config1).not.toBe(config2);
      expect(config1.label).not.toBe(config2.label);
      expect(config1.data).not.toBe(config2.data);
      expect(config1.borderColor).not.toBe(config2.borderColor);
    });

    it('should handle special characters in label', () => {
      const config = getDatasetConfig('Test & Label <>"', [1, 2, 3], '#00ff9f');
      
      expect(config.label).toBe('Test & Label <>"');
    });

    it('should handle hex colors with different formats', () => {
      const config1 = getDatasetConfig('Test', [1], '#fff');
      const config2 = getDatasetConfig('Test', [1], '#FFFFFF');
      const config3 = getDatasetConfig('Test', [1], '#00ff9f');
      
      expect(config1.borderColor).toBe('#fff');
      expect(config2.borderColor).toBe('#FFFFFF');
      expect(config3.borderColor).toBe('#00ff9f');
    });
  });

  describe('integration scenarios', () => {
    it('should work together to create complete chart configuration', () => {
      const baseOptions = getBaseChartOptions();
      const dataset1 = getDatasetConfig('AAPL', [150, 155, 152], CHART_COLORS[0]);
      const dataset2 = getDatasetConfig('GOOGL', [2800, 2850, 2820], CHART_COLORS[1]);
      
      const chartConfig = {
        ...baseOptions,
        data: {
          labels: ['Day 1', 'Day 2', 'Day 3'],
          datasets: [dataset1, dataset2],
        },
      };
      
      expect(chartConfig.responsive).toBe(true);
      expect(chartConfig.data.datasets).toHaveLength(2);
      expect(chartConfig.data.datasets[0].label).toBe('AAPL');
      expect(chartConfig.data.datasets[1].label).toBe('GOOGL');
    });

    it('should support multiple datasets with different fill settings', () => {
      const filled = getDatasetConfig('Filled', [1, 2, 3], CHART_COLORS[0], true);
      const unfilled = getDatasetConfig('Unfilled', [4, 5, 6], CHART_COLORS[1], false);
      
      expect(filled.fill).toBe(true);
      expect(filled.backgroundColor).not.toBe('transparent');
      expect(unfilled.fill).toBe(false);
      expect(unfilled.backgroundColor).toBe('transparent');
    });
  });
});

// Made with Bob