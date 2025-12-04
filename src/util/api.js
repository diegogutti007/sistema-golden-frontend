/* // src/utils/api.js
const API_BASE_URL = 'https://sistemagolden-backend-production.up.railway.app';

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // Si la respuesta no es exitosa, manejar errores
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }
      
      if (response.status === 403) {
        throw new Error('No tienes permisos para esta acción');
      }
      
      // Intentar obtener el mensaje de error del servidor
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en fetchWithAuth:', error);
    throw error;
  }
};

// Función específica para arrays (protege contra errores .map)
export const fetchArrayWithAuth = async (url) => {
  try {
    const data = await fetchWithAuth(url);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching array from ${url}:`, error);
    return [];
  }
}; */

// src/utils/api.js
class ApiClient {
  constructor() {
    this.baseUrl = this.getBaseUrl();
  }
  
  getBaseUrl() {
    // 1. Variable de entorno (la más confiable)
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // 2. Runtime detection (solo en navegador)
    if (typeof window !== 'undefined') {
      const { hostname, protocol } = window.location;
      
      // Local development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000';
      }
      
      // Production - asegurar HTTPS
      return 'https://sistemagolden-backend-production.up.railway.app';
    }
    
    // 3. Default fallback (always HTTPS for production)
    return 'https://sistemagolden-backend-production.up.railway.app';
  }
  
  url(endpoint) {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return base + cleanEndpoint;
  }
  
  async fetch(endpoint, options = {}) {
    const url = this.url(endpoint);
    console.log('📡 Fetching:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
export const BACKEND_URL = apiClient.baseUrl;