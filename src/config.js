// src/config.js
export const BACKEND_URL = (() => {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined') {
    return 'https://sistemagolden-backend-production.up.railway.app';
  }
  
  // Detectar localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  return isLocalhost 
    ? 'http://localhost:5000' 
    : 'https://sistemagolden-backend-production.up.railway.app';
})();