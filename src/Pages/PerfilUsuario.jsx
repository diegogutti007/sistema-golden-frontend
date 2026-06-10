import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Key,
  Eye,
  EyeOff,
  Award,
  Clock,
  TrendingUp,
  CheckCircle,
  Activity,
  Star,
  Briefcase
} from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: ''
  });
  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    nuevoPassword: '',
    confirmarPassword: ''
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const usuarioData = localStorage.getItem('usuario');
        if (usuarioData) {
          const usuarioObj = JSON.parse(usuarioData);
          setUsuario(usuarioObj);
          setFormData({
            nombre: usuarioObj.nombre || '',
            apellido: usuarioObj.apellido || '',
            correo: usuarioObj.correo || '',
            telefono: usuarioObj.telefono || '',
            direccion: usuarioObj.direccion || ''
          });
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarUsuario();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const guardarPerfil = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        const usuarioActualizado = { ...usuario, ...formData };
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado);
        setEditando(false);
        alert('✅ Perfil actualizado correctamente');
      } else {
        throw new Error('Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar el perfil');
    } finally {
      setCargando(false);
    }
  };

  const cambiarPassword = async () => {
    if (passwordData.nuevoPassword !== passwordData.confirmarPassword) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }

    if (passwordData.nuevoPassword.length < 6) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setCargando(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/cambiar-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          passwordActual: passwordData.passwordActual,
          nuevoPassword: passwordData.nuevoPassword
        })
      });

      if (response.ok) {
        alert('✅ Contraseña cambiada correctamente');
        setPasswordData({
          passwordActual: '',
          nuevoPassword: '',
          confirmarPassword: ''
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || '❌ Error al cambiar la contraseña');
    } finally {
      setCargando(false);
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'gerente':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'supervisor':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getRolIcon = (rol) => {
    switch (rol) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'gerente':
        return <Briefcase className="w-4 h-4" />;
      case 'supervisor':
        return <Star className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRolTexto = (rol) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'gerente':
        return 'Gerente';
      case 'supervisor':
        return 'Supervisor';
      case 'empleado':
        return 'Empleado';
      default:
        return rol;
    }
  };

  if (cargando && !usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 pt-16 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron datos</h3>
          <p className="text-gray-500 mb-6">No se pudo cargar la información del perfil</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:shadow-lg text-white px-6 py-2 rounded-xl transition-all"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header mejorado con efecto glass */}
        <div className="relative mb-8">
          {/* Fondo decorativo del header */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                {/* Avatar con efecto 3D */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-md opacity-50"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105">
                    {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {usuario.nombre} {usuario.apellido}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium shadow-md ${getRolColor(usuario.rol)}`}>
                      {getRolIcon(usuario.rol)}
                      <span>{getRolTexto(usuario.rol)}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      <span>Cuenta Activa</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!editando ? (
                  <button
                    onClick={() => setEditando(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:shadow-lg text-white px-5 py-2.5 rounded-xl transition-all transform hover:scale-105"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="font-medium">Editar Perfil</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={guardarPerfil}
                      disabled={cargando}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{cargando ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                    <button
                      onClick={() => setEditando(false)}
                      className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:shadow-lg text-white px-5 py-2.5 rounded-xl transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal - Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span>Información Personal</span>
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Nombre
                    </label>
                    {editando ? (
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-800 border border-gray-200">
                        {usuario.nombre || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Apellido
                    </label>
                    {editando ? (
                      <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-800 border border-gray-200">
                        {usuario.apellido || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-yellow-500" />
                      Correo Electrónico
                    </label>
                    {editando ? (
                      <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-800 border border-gray-200">
                        {usuario.correo || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-yellow-500" />
                      Teléfono
                    </label>
                    {editando ? (
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-800 border border-gray-200">
                        {usuario.telefono || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-yellow-500" />
                      Dirección
                    </label>
                    {editando ? (
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-800 border border-gray-200">
                        {usuario.direccion || 'No especificado'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cambiar Contraseña */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Key className="w-4 h-4 text-white" />
                  </div>
                  <span>Seguridad</span>
                </h2>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">Actualiza tu contraseña para mantener tu cuenta segura</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarPassword ? "text" : "password"}
                        name="passwordActual"
                        value={passwordData.passwordActual}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 pr-12 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {mostrarPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      name="nuevoPassword"
                      value={passwordData.nuevoPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmarPassword"
                      value={passwordData.confirmarPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <button
                    onClick={cambiarPassword}
                    disabled={cargando}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:shadow-lg text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    {cargando ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral - Tarjetas de Información */}
          <div className="space-y-6">
            {/* Tarjeta de Información de Cuenta */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <span>Información de la Cuenta</span>
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">Nombre de Usuario</p>
                  <p className="text-white font-mono text-sm">{usuario.usuario}</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">ID de Usuario</p>
                  <p className="text-yellow-400 font-mono text-sm">#{usuario.usuario_id}</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Último Acceso
                  </p>
                  <p className="text-white text-sm">
                    {new Date().toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta de Estadísticas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span>Actividad Reciente</span>
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-600">Estado de la cuenta</span>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Activa</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-600">Citas registradas</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">0</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-600">Rango</span>
                  </div>
                  <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    {getRolTexto(usuario.rol)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="text-gray-600">Miembro desde</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta de Consejo de Seguridad */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Consejo de Seguridad</h3>
                  <p className="text-sm text-amber-700">
                    Mantén tu contraseña segura y no la compartas con nadie. 
                    Cambia tu contraseña periódicamente para mayor seguridad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}