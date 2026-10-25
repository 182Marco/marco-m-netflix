export const BASE_URL = (
  process.env.VUE_APP_CHAT_API_URL || 'http://localhost:8000'
).replace(/\/$/, '');

// stesso limite di WEB_API_MAX_MESSAGE_CHARS (default del backend)
export const MAX_MESSAGE_CHARS = 2000;

// attesa del backend dopo una disconnessione (GET /conversations/{id})
export const RECONCILE = { attempts: 30, intervalMs: 2000 };
