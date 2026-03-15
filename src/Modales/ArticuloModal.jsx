import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function ArticuloModal({ isOpen, onRequestClose, onGuardar, articuloEdit, categorias }) {
  const [formData, setFormData] = useState({
    Codigo: "",
    Nombre: "",
    Descripcion: "",
    PrecioCompra: "",
    PrecioVenta: "",
    Stock: "",
    UnidadMedida: "UND",
    CategoriaID: "",
    Estado: "Activo"
  });

  // Cargar datos del artículo si estamos editando
  useEffect(() => {
    if (articuloEdit) {
      setFormData({
        Codigo: articuloEdit.Codigo || "",
        Nombre: articuloEdit.Nombre || "",
        Descripcion: articuloEdit.Descripcion || "",
        PrecioCompra: articuloEdit.PrecioCompra || "",
        PrecioVenta: articuloEdit.PrecioVenta || "",
        Stock: articuloEdit.Stock || "",
        UnidadMedida: articuloEdit.UnidadMedida || "UND",
        CategoriaID: articuloEdit.CategoriaID || "",
        Estado: articuloEdit.Estado || "Activo"
      });
    } else {
      // Limpiar formulario para nuevo artículo
      setFormData({
        Codigo: "",
        Nombre: "",
        Descripcion: "",
        PrecioCompra: "",
        PrecioVenta: "",
        Stock: "",
        UnidadMedida: "UND",
        CategoriaID: "",
        Estado: "Activo"
      });
    }
  }, [articuloEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.Nombre || !formData.PrecioVenta) {
      alert("El nombre y precio de venta son obligatorios");
      return;
    }

    onGuardar(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center"
    >
      <h2 className="text-xl font-bold mb-4">
        {articuloEdit ? "Editar Artículo" : "Nuevo Artículo"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código
            </label>
            <input
              type="text"
              name="Codigo"
              value={formData.Codigo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Código del artículo"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Nombre"
              value={formData.Nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre del artículo"
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="Descripcion"
              value={formData.Descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción del artículo"
            />
          </div>

          {/* Precio Compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Compra
            </label>
            <input
              type="number"
              step="0.01"
              name="PrecioCompra"
              value={formData.PrecioCompra}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Precio Venta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Venta <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="PrecioVenta"
              value={formData.PrecioVenta}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              name="Stock"
              value={formData.Stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          {/* Unidad de Medida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidad de Medida
            </label>
            <select
              name="UnidadMedida"
              value={formData.UnidadMedida}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="UND">UND</option>
              <option value="KG">KG</option>
              <option value="LT">LT</option>
              <option value="M">M</option>
              <option value="M2">M2</option>
              <option value="M3">M3</option>
              <option value="DOC">DOC</option>
              <option value="PAQ">PAQ</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              name="CategoriaID"
              value={formData.CategoriaID}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Seleccionar categoría --</option>
              {categorias.map(cat => (
                <option key={cat.CategoriaID} value={cat.CategoriaID}>
                  {cat.Nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="Estado"
              value={formData.Estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onRequestClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {articuloEdit ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}