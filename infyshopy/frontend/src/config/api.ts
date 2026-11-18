/**
 * Infyshopy API Configuration
 * 
 * - In Development (Vite Dev Server):
 *   Vite dev proxy (vite.config.ts) forwards relative paths (/api/* and /auth/*) to VITE_API_TARGET
 *   (default: http://localhost:5000).
 * 
 * - In Production on Vercel:
 *   vercel.json rewrites /api/:path* and /auth/:path+ to https://infyshopy-backend.vercel.app,
 *   preserving same-origin cookies and avoiding third-party cookie restrictions.
 * 
 * - Optional Build-Time Override:
 *   If VITE_API_BASE_URL is explicitly configured, apiUrl(path) prepends it.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
}
