const rawUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://smart-bharat-civic-companion-rk6z.onrender.com';
export const API_BASE_URL = rawUrl.trim().replace(/\/+$/, '');
