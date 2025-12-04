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
// src/utils/api.js

// Configuraciones predefinidas
const API_CONFIGS = {
  development: {
    url: 'http://localhost:5000',
    protocol: 'http'
  },
  production: {
    url: 'https://sistemagolden-backend-production.up.railway.app',
    protocol: 'https'
  }
};

// Detectar entorno
const detectEnvironment = () => {
  // 1. Por variable de entorno explícita
  if (process.env.REACT_APP_ENVIRONMENT) {
    return process.env.REACT_APP_ENVIRONMENT;
  }
  
  // 2. Por hostname en el navegador
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    
    // Agrega aquí otros dominios de desarrollo si los tienes
    if (hostname.includes('dev.') || hostname.includes('staging.')) {
      return 'staging';
    }
    
    return 'production';
  }
  
  // 3. Por defecto, producción
  return 'production';
};

// Obtener URL base con validación
const getBaseUrl = () => {
  const environment = detectEnvironment();
  
  // Opción 1: URL específica desde variable de entorno
  if (process.env.REACT_APP_API_URL) {
    let url = process.env.REACT_APP_API_URL.trim();
    
    // Validar y corregir URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Añadir protocolo basado en entorno
      const protocol = environment === 'development' ? 'http://' : 'https://';
      url = protocol + url;
      console.warn(`⚠️  Añadido protocolo ${protocol} a la URL`);
    }
    
    console.log(`✅ Usando URL personalizada: ${url}`);
    return url;
  }
  
  // Opción 2: URL predefinida según entorno
  const config = API_CONFIGS[environment] || API_CONFIGS.production;
  console.log(`✅ Usando configuración ${environment}: ${config.url}`);
  return config.url;
};

class ApiClient {
  constructor() {
    this.baseUrl = getBaseUrl();
    console.log('🚀 ApiClient inicializado con baseUrl:', this.baseUrl);
  }
  
  // Normalizar URL (asegurar formato correcto)
  normalizeUrl(base, endpoint) {
    // Remover / al final de la base
    const cleanBase = base.replace(/\/+$/, '');
    
    // Añadir / al inicio del endpoint si no lo tiene
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${cleanBase}${cleanEndpoint}`;
  }
  
  url(endpoint) {
    return this.normalizeUrl(this.baseUrl, endpoint);
  }
  
  async fetch(endpoint, options = {}) {
    const url = this.url(endpoint);
    console.log('📡 Fetching URL:', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('❌ Error en fetch:', error.message);
      throw error;
    }
  }
  
  // Métodos específicos para tu aplicación
  async getGastos() {
    return this.fetch('/api/gastos');
  }
  
  async getGastoById(id) {
    return this.fetch(`/api/gastos/${id}`);
  }
  
  async createGasto(data) {
    return this.fetch('/api/gastos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async updateGasto(id, data) {
    return this.fetch(`/api/gastos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async deleteGasto(id) {
    return this.fetch(`/api/gastos/${id}`, {
      method: 'DELETE'
    });
  }
}

export const apiClient = new ApiClient();
export const BACKEND_URL = apiClient.baseUrl;

// Función helper para usar en componentes antiguos
export const createApiUrl = (endpoint) => {
  return apiClient.url(endpoint);
};