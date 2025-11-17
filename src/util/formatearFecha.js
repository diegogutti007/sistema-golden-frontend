// src/utils/formatearFecha.js

// Función para formatear fecha y hora
export const formatearFecha = (fechaISO, horaFin) => {
  const fecha = new Date(fechaISO);
  const opcionesFecha = { day: "2-digit", month: "short" };
  const opcionesHora = { hour: "2-digit", minute: "2-digit", hour12: false };

  const fechaTexto = fecha
    .toLocaleDateString("es-ES", opcionesFecha)
    .replace(".", "") // elimina el punto final que a veces pone "oct."
    .toUpperCase();   // pasa a MAYÚSCULAS, ej: "22 OCT"

  const horaInicio = fecha.toLocaleTimeString("es-ES", opcionesHora);
  
  let rango = horaInicio;
  if (horaFin) {
    const fin = new Date(horaFin);
    const horaFinal = fin.toLocaleTimeString("es-ES", opcionesHora);
    rango = `${horaInicio}-${horaFinal}`;
  }

  return `${fechaTexto} ${rango}`;
};