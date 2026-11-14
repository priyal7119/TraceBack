import axios from 'axios';

/**
 * Resolve API Gateway or Local Base URL
 * - If VITE_API_BASE_URL starts with http/https, ensures it ends with /api for route consistency.
 * - If unset or relative, defaults to '/api' (matching local Express routes and Vite proxy).
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const getNormalizedBaseUrl = (url) => {
  if (!url) return '/api';
  const trimmed = url.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return trimmed || '/api';
};

const resolvedBaseUrl = getNormalizedBaseUrl(rawBaseUrl);

// Base API client configured for HTTP-only cookie authentication and AWS API Gateway / Lambda
const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 30000, // 30 seconds for cloud cold starts and Rekognition analysis
  withCredentials: true, // Automatically sends and receives HTTP-only cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle session expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or unauthenticated
      console.warn('[TraceBack Auth] Session expired or unauthorized.');
    }
    return Promise.reject(error);
  }
);

export default api;
