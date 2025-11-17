// src/utils/api.js
const API_BASE_URL = 'http://localhost:5000';

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
};