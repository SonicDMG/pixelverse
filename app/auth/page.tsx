'use client';

/**
 * Cyberpunk Authentication Landing Page
 * Retro-styled login page with pixel art aesthetic
 */

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './auth.module.css';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  // Get redirect URL and protected flag from query params
  const redirectUrl = searchParams.get('redirect') || '/';
  const isProtected = searchParams.get('protected') === 'true';

  useEffect(() => {
    // Add Press Start 2P font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Successful login - redirect to original destination
        router.push(redirectUrl);
        router.refresh();
      } else {
        // Show error message
        setError(data.error || 'Authentication failed');
        setPassword('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    if (isProtected) {
      setError('This page requires full authentication. Guest access is not allowed.');
      return;
    }

    setError('');
    setIsGuestLoading(true);

    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Successful guest session - redirect
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError(data.error || 'Failed to create guest session');
      }
    } catch (err) {
      console.error('Guest access error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated background grid */}
      <div className={styles.backgroundGrid} />
      
      {/* CRT scanlines effect */}
      <div className={styles.scanlines} />

      {/* Main authentication card */}
      <div className={styles.authCard}>
        {/* Decorative corners */}
        <div className={`${styles.corner} ${styles.cornerTopLeft}`} />
        <div className={`${styles.corner} ${styles.cornerTopRight}`} />
        <div className={`${styles.corner} ${styles.cornerBottomLeft}`} />
        <div className={`${styles.corner} ${styles.cornerBottomRight}`} />

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>PIXELVERSE</h1>
          <p className={styles.subtitle}>SECURE ACCESS TERMINAL</p>
          <p className={styles.accessDenied}>
            {isProtected ? '⚠ FULL AUTH REQUIRED ⚠' : '⚠ ACCESS RESTRICTED ⚠'}
          </p>
          {isProtected && (
            <p style={{
              fontSize: '0.6rem',
              color: '#ff00ff',
              marginTop: '0.5rem',
              textAlign: 'center'
            }}>
              Test pages require authentication
            </p>
          )}
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              {'>'} ENTER ACCESS CODE
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              disabled={isLoading}
              autoFocus
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.error}>
              ⚠ ERROR: {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || !password}
          >
            {isLoading ? (
              <span className={styles.loading}>AUTHENTICATING...</span>
            ) : (
              '▶ ENTER SYSTEM'
            )}
          </button>

          {!isProtected && (
            <>
              <div style={{
                textAlign: 'center',
                fontSize: '0.6rem',
                color: 'rgba(0, 212, 255, 0.5)',
                margin: '1rem 0',
                letterSpacing: '1px'
              }}>
                - OR -
              </div>

              <button
                type="button"
                onClick={handleGuestAccess}
                className={styles.button}
                style={{
                  background: 'linear-gradient(135deg, #9370DB 0%, #4169E1 100%)',
                }}
                disabled={isGuestLoading}
              >
                {isGuestLoading ? (
                  <span className={styles.loading}>CONNECTING...</span>
                ) : (
                  '👤 GUEST ACCESS'
                )}
              </button>

              <div style={{
                textAlign: 'center',
                fontSize: '0.55rem',
                color: 'rgba(0, 212, 255, 0.4)',
                marginTop: '0.5rem',
                letterSpacing: '1px'
              }}>
                Limited access • No test pages
              </div>
            </>
          )}
        </form>

        {/* Additional info */}
        <div style={{ 
          marginTop: '2rem', 
          textAlign: 'center', 
          fontSize: '0.6rem', 
          color: 'rgba(0, 212, 255, 0.5)',
          letterSpacing: '1px'
        }}>
          AUTHORIZED PERSONNEL ONLY
        </div>
      </div>
    </div>
  );
}

// Made with Bob