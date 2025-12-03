import React, { useState } from "react";
import Modal from "react-modal";
import { FaPlus, FaTimes, FaUser, FaPhone, FaEnvelope, FaSave } from "react-icons/fa";

export default function ModalCliente({ isOpen, onClose, recargarClientes }) {
  const [form, setForm] = useState({
    Nombre: "",
    Apellido: "",
    Telefono: "",
    Email: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!form.Nombre.trim()) {
      newErrors.Nombre = "El nombre es obligatorio";
    } else if (form.Nombre.length < 2) {
      newErrors.Nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!form.Apellido.trim()) {
      newErrors.Apellido = "El apellido es obligatorio";
    } else if (form.Apellido.length < 2) {
      newErrors.Apellido = "El apellido debe tener al menos 2 caracteres";
    }

    if (form.Telefono && form.Telefono.replace(/\D/g, '').length < 9) {
      newErrors.Telefono = "El teléfono debe tener al menos 9 dígitos";
    }

    if (form.Email && !/\S+@\S+\.\S+/.test(form.Email)) {
      newErrors.Email = "Ingresa un email válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Formatear teléfono automáticamente
  const formatTelefono = (value) => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 2) {
      return numbers ? `+${numbers}` : '';
    } else if (numbers.length <= 5) {
      return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `+${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
    } else {
      return `+${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 8)} ${numbers.slice(8, 11)}`;
    }
  };

  const handleTelefonoChange = (e) => {
    const formatted = formatTelefono(e.target.value);
    setForm({ ...form, Telefono: formatted });
    if (errors.Telefono) setErrors({ ...errors, Telefono: '' });
  };

  const guardarCliente = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch("https://sistemagolden-backend-production.up.railway.app/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("✅ Cliente registrado correctamente");
        setForm({ Nombre: "", Apellido: "", Telefono: "", Email: "" });
        setErrors({});
        recargarClientes();
        onClose();
      } else {
        alert("❌ Error al registrar cliente");
      }
    } catch (error) {
      alert("❌ Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ Nombre: "", Apellido: "", Telefono: "", Email: "" });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative transform transition-all duration-300"
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      ariaHideApp={false}
      style={{
        overlay: {
          zIndex: 70,
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        },
        content: {
          zIndex: 71
        }
      }}
    >
      {/* Header con Gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <FaUser className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Nuevo Cliente</h3>
              <p className="text-blue-100 text-sm">Completa la información del cliente</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors duration-200"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={guardarCliente} className="p-6 space-y-4">
        {/* Nombre y Apellido en misma línea */}
        <div className="grid grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Ej: Juan"
                className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.Nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                value={form.Nombre}
                onChange={(e) => {
                  setForm({ ...form, Nombre: e.target.value });
                  if (errors.Nombre) setErrors({ ...errors, Nombre: '' });
                }}
              />
            </div>
            {errors.Nombre && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                ⚠️ {errors.Nombre}
              </p>
            )}
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Apellido *
            </label>
            <input
              type="text"
              placeholder="Ej: Pérez"
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.Apellido ? 'border-red-500' : 'border-gray-300'
                }`}
              value={form.Apellido}
              onChange={(e) => {
                setForm({ ...form, Apellido: e.target.value });
                if (errors.Apellido) setErrors({ ...errors, Apellido: '' });
              }}
            />
            {errors.Apellido && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                ⚠️ {errors.Apellido}
              </p>
            )}
          </div>
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400" />
            </div>
            <input
              type="tel"
              placeholder="Ej: +51 987 654 321"
              className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.Telefono ? 'border-red-500' : 'border-gray-300'
                }`}
              value={form.Telefono}
              onChange={handleTelefonoChange}
              maxLength="17"
            />
          </div>
          {errors.Telefono ? (
            <p className="text-red-500 text-xs flex items-center gap-1">
              ⚠️ {errors.Telefono}
            </p>
          ) : (
            <p className="text-gray-500 text-xs">
              📞 Formato automático: +51 XXX XXX XXX
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Ej: cliente@email.com"
              className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.Email ? 'border-red-500' : 'border-gray-300'
                }`}
              value={form.Email}
              onChange={(e) => {
                setForm({ ...form, Email: e.target.value });
                if (errors.Email) setErrors({ ...errors, Email: '' });
              }}
            />
          </div>
          {errors.Email && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              ⚠️ {errors.Email}
            </p>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FaTimes />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Guardando...
              </>
            ) : (
              <>
                <FaSave />
                Guardar Cliente
              </>
            )}
          </button>
        </div>

        {/* Nota informativa */}
        <p className="text-xs text-gray-500 text-center">
          Los campos marcados con * son obligatorios
        </p>
      </form>
    </Modal>
  );
}