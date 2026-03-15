import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function VentaModal({ isOpen, onRequestClose, onGuardar }) {
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [pagoRecibido, setPagoRecibido] = useState("");
  const [vuelto, setVuelto] = useState(0);
  const [metodoVuelto, setMetodoVuelto] = useState("");
  const [mostrarOpcionesVuelto, setMostrarOpcionesVuelto] = useState(false);

  // Calcular vuelto cuando cambian monto o pagoRecibido
  useEffect(() => {
    if (monto && pagoRecibido) {
      const montoNumerico = parseFloat(monto);
      const pagoNumerico = parseFloat(pagoRecibido);
      
      if (pagoNumerico > montoNumerico) {
        setVuelto(pagoNumerico - montoNumerico);
        setMostrarOpcionesVuelto(true);
      } else {
        setVuelto(0);
        setMostrarOpcionesVuelto(false);
        setMetodoVuelto("");
      }
    } else {
      setVuelto(0);
      setMostrarOpcionesVuelto(false);
      setMetodoVuelto("");
    }
  }, [monto, pagoRecibido]);

  const handleGuardar = () => {
    if (!monto || !metodoPago) {
      alert("Por favor completa todos los campos.");
      return;
    }

    // Validar que si hay vuelto, se haya seleccionado método de vuelto
    if (vuelto > 0 && !metodoVuelto) {
      alert("Por favor selecciona el método de vuelto.");
      return;
    }

    const ventaData = {
      monto: parseFloat(monto),
      metodoPago,
      cantidad: parseInt(cantidad),
      pagoRecibido: pagoRecibido ? parseFloat(pagoRecibido) : null,
      vuelto: vuelto > 0 ? vuelto : null,
      metodoVuelto: vuelto > 0 ? metodoVuelto : null,
    };

    console.log("Datos de venta a guardar:", ventaData); // Para depuración
    onGuardar(ventaData);
    
    // Limpiar formulario
    setMonto("");
    setMetodoPago("");
    setCantidad(1);
    setPagoRecibido("");
    setVuelto(0);
    setMetodoVuelto("");
    setMostrarOpcionesVuelto(false);
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
            placeholder="0.00"
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

        {/* NUEVO CAMPO: Pago con */}
        <div>
          <label className="block text-sm font-medium">Pago con</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            value={pagoRecibido}
            onChange={(e) => setPagoRecibido(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* NUEVO: Mostrar vuelto si aplica */}
        {vuelto > 0 && (
          <>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="font-semibold text-yellow-800">
                Vuelto a devolver: S/ {vuelto.toFixed(2)}
              </p>
            </div>

            {/* NUEVO: Método de vuelto */}
            <div>
              <label className="block text-sm font-medium">
                Método de vuelto
              </label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={metodoVuelto}
                onChange={(e) => setMetodoVuelto(e.target.value)}
              >
                <option value="">-- Seleccionar método de vuelto --</option>
                <option>Yape / Plin</option>
                <option>Transferencia bancaria</option>
                <option>Efectivo</option>
                <option>Saldo a favor</option>
              </select>
            </div>
          </>
        )}

        {/* NUEVO: Alerta si falta dinero */}
        {monto && pagoRecibido && parseFloat(pagoRecibido) < parseFloat(monto) && (
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <p className="text-red-800">
              <span className="font-semibold">Falta:</span> S/ {(parseFloat(monto) - parseFloat(pagoRecibido)).toFixed(2)}
            </p>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={handleGuardar}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Guardar Venta
          </button>

          <button
            onClick={onRequestClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}