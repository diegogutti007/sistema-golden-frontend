// Prueba con estas URLs - reemplaza con TU URL real
export const API_URLS = {
  // Agrega aquí la URL REAL de tu backend en Railway
  railway: "https://sistemagolden-backend-production.up.railway.app", // ← REEMPLAZA ESTO
  local: "http://localhost:5000"
};

export const getAPIUrl = () => {
  // Priorizar la variable de entorno, sino usar local
  return process.env.REACT_APP_API_URL || API_URLS.local;
};