'use client';

/**
 * UserStatus Component
 * Displays authentication status and logout button
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserStatusProps {
  theme?: {
    colors: {
      primary: string;
      accent: string;
      neonMagenta: string;
    };
  };
}

export function UserStatus({ theme }: UserStatusProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Check authentication status via API
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include', // Include cookies in request
      });
      
      if (!response.ok) {
        console.error('Failed to fetch auth status:', response.status);
        setIsAuthenticated(null);
        return;
      }

      const data = await response.json();
      
      // Set authenticated to true if AUTH, false if GUEST
      if (data.isAuthenticated) {
        setIsAuthenticated(true);
      } else if (data.isGuest) {
        setIsAuthenticated(false);
      } else {
        // No authentication found
        setIsAuthenticated(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to auth page
        router.push('/auth');
        router.refresh();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't render anything if we haven't checked status yet
  if (isAuthenticated === null) {
    return null;
  }

  const primaryColor = theme?.colors.primary || '#00ff9f';
  const accentColor = theme?.colors.accent || '#ff00ff';
  const magentaColor = theme?.colors.neonMagenta || '#9370DB';

  return (
    <div className="flex items-center gap-2 font-pixel text-xs">
      {/* Status indicator */}
      <div 
        className="flex items-center gap-2 px-3 py-1 border-2 pixel-border"
        style={{
          borderColor: isAuthenticated ? primaryColor : magentaColor,
          backgroundColor: 'rgba(26, 31, 58, 0.8)',
        }}
      >
        <span
          className="inline-block w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: isAuthenticated ? primaryColor : magentaColor,
            boxShadow: `0 0 8px ${isAuthenticated ? primaryColor : magentaColor}`,
          }}
        />
        <span style={{ color: isAuthenticated ? primaryColor : magentaColor }}>
          {isAuthenticated ? 'AUTH' : 'GUEST'}
        </span>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="px-3 py-1 border-2 pixel-border hover:bg-opacity-20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          borderColor: accentColor,
          color: accentColor,
          backgroundColor: 'rgba(26, 31, 58, 0.8)',
        }}
        title="Logout"
      >
        {isLoggingOut ? '...' : 'LOGOUT'}
      </button>
    </div>
  );
}

// Made with Bob