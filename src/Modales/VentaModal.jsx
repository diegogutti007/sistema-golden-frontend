import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function VentaModal({ isOpen, onRequestClose, onGuardar }) {
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const handleGuardar = () => {
    if (!monto || !metodoPago) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const ventaData = {
      monto: parseFloat(monto),
      metodoPago,
      cantidad,
    };

    onGuardar(ventaData);
    setMonto("");
    setMetodoPago("");
    setCantidad(1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-auto"
      overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center"
    >
      <h2 className="text-xl font-bold mb-4">Registrar Venta</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Monto</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Método de pago</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Yape / Plin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Cantidad</label>
          <input
            type="number"
            min="1"
            className="w-full border px-3 py-2 rounded"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={handleGuardar}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Guardar Venta
          </button>

          <button
            onClick={onRequestClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
