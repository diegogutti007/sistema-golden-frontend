// src/config.js
export const API_CONFIG = {
  // Para desarrollo local
  development: 'http://localhost:5000',
  
  // Para producción (Railway)
  production: 'https://sistemagolden-backend-production.up.railway.app',
  
  // Obtener la URL basada en el entorno
  getBaseUrl: () => {
    // Prioridad 1: Variable de entorno específica
    if (process.env.REACT_APP_API_URL) {
      console.log("✅ Usando REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
      return process.env.REACT_APP_API_URL;
    }
    
    // Prioridad 2: Detectar entorno de Railway
    if (window.location.hostname.includes('railway')) {
      console.log("🚂 Detectado Railway, usando backend de producción");
      return 'https://sistemagolden-backend-production.up.railway.app';
    }
    
    // Prioridad 3: Por defecto desarrollo local
    console.log("💻 Entorno local, usando localhost:5000");
    return 'http://localhost:5000';
  }
};

export const BACKEND_URL = API_CONFIG.getBaseUrl();