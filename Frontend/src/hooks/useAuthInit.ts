import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

/**
 * Hook to initialize and maintain authentication state
 * - Checks for access token on mount
 * - Attempts refresh if user exists but no valid token
 * - Periodically refreshes token every 10 minutes (before 15min expiry)
 * - Redirects to login if refresh fails
 */
export const useAuthInit = () => {
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const user = authService.getCurrentUser();
      
      // If no user in localStorage, let normal flow handle it
      if (!user) {
        return false;
      }

      // Check if access token exists in cookies
      const hasAccessToken = document.cookie
        .split(';')
        .some(cookie => cookie.trim().startsWith('accessToken='));

      if (hasAccessToken) {
        return true;
      }

      // No access token but user exists - try to refresh
      console.log('[Auth] ⚠️  No hay access token, intentando refresh...');
      
      try {
        await authService.refreshToken();
        console.log('[Auth] ✅ Token refrescado exitosamente');
        return true;
      } catch (error) {
        console.error('[Auth] ❌ Refresh falló, cerrando sesión...', error);
        
        // Clear user data and redirect to login
        authService.clearCurrentUser();
        navigate('/login', { replace: true });
        return false;
      }
    };

    // Initial check
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('[Auth] Inicializando autenticación...');
      checkAndRefreshToken();
    }

    // Periodic refresh every 10 minutes (token expires at 15min)
    // This ensures we always have a valid token before it expires
    const refreshInterval = setInterval(() => {
      console.log('[Auth] 🔄 Refresh periódico del token...');
      checkAndRefreshToken();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, [navigate]);
};

