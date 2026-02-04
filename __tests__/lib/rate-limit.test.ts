/**
 * Tests for Rate Limiting Middleware
 */

import {
  rateLimit,
  trackConnection,
  releaseConnection,
  getConnectionCount,
  createRateLimitHeaders,
  getClientIp,
  RateLimitPresets,
  clearAllLimits,
  stopCleanup,
} from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear all rate limit data before each test
    clearAllLimits();
  });

  afterAll(() => {
    // Stop cleanup timer after all tests
    stopCleanup();
  });

  describe('rateLimit', () => {
    it('should allow requests within limit', () => {
      const config = { limit: 5, windowMs: 60000 };
      const ip = '192.168.1.1';

      // First request should succeed
      const result1 = rateLimit(ip, config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);
      expect(result1.limit).toBe(5);

      // Second request should succeed
      const result2 = rateLimit(ip, config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests exceeding limit', () => {
      const config = { limit: 3, windowMs: 60000 };
      const ip = '192.168.1.2';

      // Use up all requests
      rateLimit(ip, config);
      rateLimit(ip, config);
      rateLimit(ip, config);

      // Fourth request should be blocked
      const result = rateLimit(ip, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after time window expires', async () => {
      const config = { limit: 2, windowMs: 100 }; // 100ms window
      const ip = '192.168.1.3';

      // Use up all requests
      rateLimit(ip, config);
      rateLimit(ip, config);

      // Should be blocked
      const blocked = rateLimit(ip, config);
      expect(blocked.success).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be allowed again
      const allowed = rateLimit(ip, config);
      expect(allowed.success).toBe(true);
      expect(allowed.remaining).toBe(1);
    });

    it('should track different IPs independently', () => {
      const config = { limit: 2, windowMs: 60000 };
      const ip1 = '192.168.1.4';
      const ip2 = '192.168.1.5';

      // Use up requests for ip1
      rateLimit(ip1, config);
      rateLimit(ip1, config);

      // ip1 should be blocked
      const result1 = rateLimit(ip1, config);
      expect(result1.success).toBe(false);

      // ip2 should still be allowed
      const result2 = rateLimit(ip2, config);
      expect(result2.success).toBe(true);
    });

    it('should include reset timestamp', () => {
      const config = { limit: 5, windowMs: 60000 };
      const ip = '192.168.1.6';
      const before = Date.now();

      const result = rateLimit(ip, config);

      expect(result.reset).toBeGreaterThan(before);
      expect(result.reset).toBeLessThanOrEqual(before + config.windowMs + 10);
    });
  });

  describe('Connection Tracking', () => {
    it('should track concurrent connections', () => {
      const ip = '192.168.1.10';
      const maxConnections = 3;

      // Add first connection
      const result1 = trackConnection(ip, 'conn-1', maxConnections);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);
      expect(getConnectionCount(ip)).toBe(1);

      // Add second connection
      const result2 = trackConnection(ip, 'conn-2', maxConnections);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);
      expect(getConnectionCount(ip)).toBe(2);
    });

    it('should block connections exceeding limit', () => {
      const ip = '192.168.1.11';
      const maxConnections = 2;

      // Add connections up to limit
      trackConnection(ip, 'conn-1', maxConnections);
      trackConnection(ip, 'conn-2', maxConnections);

      // Third connection should be blocked
      const result = trackConnection(ip, 'conn-3', maxConnections);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBe(60);
    });

    it('should release connections properly', () => {
      const ip = '192.168.1.12';
      const maxConnections = 3;

      // Add connections
      trackConnection(ip, 'conn-1', maxConnections);
      trackConnection(ip, 'conn-2', maxConnections);
      expect(getConnectionCount(ip)).toBe(2);

      // Release one connection
      releaseConnection(ip, 'conn-1');
      expect(getConnectionCount(ip)).toBe(1);

      // Should be able to add another connection
      const result = trackConnection(ip, 'conn-3', maxConnections);
      expect(result.success).toBe(true);
      expect(getConnectionCount(ip)).toBe(2);
    });

    it('should not double-count same connection ID', () => {
      const ip = '192.168.1.13';
      const maxConnections = 3;

      // Add same connection twice
      trackConnection(ip, 'conn-1', maxConnections);
      trackConnection(ip, 'conn-1', maxConnections);

      // Should only count once
      expect(getConnectionCount(ip)).toBe(1);
    });

    it('should handle releasing non-existent connections gracefully', () => {
      const ip = '192.168.1.14';

      // Should not throw error
      expect(() => {
        releaseConnection(ip, 'non-existent');
      }).not.toThrow();

      expect(getConnectionCount(ip)).toBe(0);
    });

    it('should track different IPs independently for connections', () => {
      const ip1 = '192.168.1.15';
      const ip2 = '192.168.1.16';
      const maxConnections = 2;

      // Add connections for both IPs
      trackConnection(ip1, 'conn-1', maxConnections);
      trackConnection(ip1, 'conn-2', maxConnections);
      trackConnection(ip2, 'conn-1', maxConnections);

      // ip1 should be at limit
      const result1 = trackConnection(ip1, 'conn-3', maxConnections);
      expect(result1.success).toBe(false);

      // ip2 should still have room
      const result2 = trackConnection(ip2, 'conn-2', maxConnections);
      expect(result2.success).toBe(true);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should create correct headers for successful request', () => {
      const result = {
        success: true,
        limit: 10,
        remaining: 7,
        reset: 1234567890,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('7');
      expect(headers['X-RateLimit-Reset']).toBe('1234567890');
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should include Retry-After header when rate limited', () => {
      const result = {
        success: false,
        limit: 10,
        remaining: 0,
        reset: 1234567890,
        retryAfter: 45,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['Retry-After']).toBe('45');
    });
  });

  describe('Client IP Extraction', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers({
        'x-forwarded-for': '203.0.113.1, 198.51.100.1',
      });

      const ip = getClientIp(headers);
      expect(ip).toBe('203.0.113.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const headers = new Headers({
        'x-real-ip': '203.0.113.2',
      });

      const ip = getClientIp(headers);
      expect(ip).toBe('203.0.113.2');
    });

    it('should extract IP from cf-connecting-ip header', () => {
      const headers = new Headers({
        'cf-connecting-ip': '203.0.113.3',
      });

      const ip = getClientIp(headers);
      expect(ip).toBe('203.0.113.3');
    });

    it('should prioritize x-forwarded-for over other headers', () => {
      const headers = new Headers({
        'x-forwarded-for': '203.0.113.4',
        'x-real-ip': '203.0.113.5',
        'cf-connecting-ip': '203.0.113.6',
      });

      const ip = getClientIp(headers);
      expect(ip).toBe('203.0.113.4');
    });

    it('should return localhost for missing headers', () => {
      const headers = new Headers();
      const ip = getClientIp(headers);
      expect(ip).toBe('127.0.0.1');
    });

    it('should trim whitespace from IP addresses', () => {
      const headers = new Headers({
        'x-forwarded-for': '  203.0.113.7  , 198.51.100.1',
      });

      const ip = getClientIp(headers);
      expect(ip).toBe('203.0.113.7');
    });
  });

  describe('Rate Limit Presets', () => {
    it('should have correct AUTH preset', () => {
      expect(RateLimitPresets.AUTH).toEqual({
        limit: 5,
        windowMs: 60000,
      });
    });

    it('should have correct AI_QUERY preset', () => {
      expect(RateLimitPresets.AI_QUERY).toEqual({
        limit: 10,
        windowMs: 60000,
      });
    });

    it('should have correct IMAGE_GEN preset', () => {
      expect(RateLimitPresets.IMAGE_GEN).toEqual({
        limit: 3,
        windowMs: 60000,
      });
    });

    it('should have correct STREAMING preset', () => {
      expect(RateLimitPresets.STREAMING).toEqual({
        limit: 5,
        windowMs: 60000,
      });
    });

    it('should have correct MEDIA preset', () => {
      expect(RateLimitPresets.MEDIA).toEqual({
        limit: 20,
        windowMs: 60000,
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle mixed request and connection tracking', () => {
      const ip = '192.168.1.20';

      // Test request rate limiting
      const reqResult = rateLimit(ip, RateLimitPresets.AI_QUERY);
      expect(reqResult.success).toBe(true);

      // Test connection tracking (should be independent)
      const connResult = trackConnection(ip, 'conn-1', 5);
      expect(connResult.success).toBe(true);

      // Both should work independently
      expect(getConnectionCount(ip)).toBe(1);
    });

    it('should handle rapid successive requests correctly', () => {
      const ip = '192.168.1.21';
      const config = { limit: 5, windowMs: 60000 };
      const results = [];

      // Make 7 rapid requests
      for (let i = 0; i < 7; i++) {
        results.push(rateLimit(ip, config));
      }

      // First 5 should succeed
      expect(results.slice(0, 5).every(r => r.success)).toBe(true);

      // Last 2 should fail
      expect(results.slice(5).every(r => !r.success)).toBe(true);
    });
  });
});

// Made with Bob