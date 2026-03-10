import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "react-modal";
import { FaPlus, FaCalendarAlt, FaSyncAlt, FaMoneyBillWave, FaWallet, FaCreditCard, FaChartLine, FaCalendarDay } from "react-icons/fa";
import { BsCashCoin, BsPhone } from "react-icons/bs";
import esLocale from "@fullcalendar/core/locales/es";
import listPlugin from "@fullcalendar/list";
import "@fullcalendar/bootstrap5";
import "bootstrap/dist/css/bootstrap.min.css";
import ModalCita from "../Modales/ModalCita";
import ModalVenta from "../Modales/ModalVenta";
import ModalCliente from "../Modales/ModalCliente";
import { BACKEND_URL } from '../config';

Modal.setAppElement("#root");

export default function AgendaCitas() {
  //const [estadoAnterior, setEstadoAnterior] = useState("Programada");
  const [eventos, setEventos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [Empleados, setEmpleados] = useState([]);
  const [modalCita, setModalCita] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Referencia al calendario
  const calendarRef = useRef(null);

  // Estados para estadísticas de ventas
  const [estadisticasVentas, setEstadisticasVentas] = useState({
    diaSeleccionado: {
      fecha: new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      total: 0,
      efectivo: 0,
      yape: 0,
      plin: 0,
      citasCompletadas: 0
    },
    semanaActual: {
      fechaInicio: "",
      fechaFin: "",
      total: 0,
      efectivo: 0,
      yape: 0,
      plin: 0,
      citasCompletadas: 0
    },
    totalGeneral: 0
  });
  const [isLoadingVentas, setIsLoadingVentas] = useState(false);

  // Fechas activas para consulta
  const [fechasConsulta, setFechasConsulta] = useState({
    diaSeleccionado: new Date(),
    semanaInicio: new Date(),
    semanaFin: new Date()
  });

  // Estado para controlar qué día está seleccionado (para resaltar)
  const [diaSeleccionadoId, setDiaSeleccionadoId] = useState(null);

  const [form, setForm] = useState({
    CitaID: null,
    ClienteID: "",
    EmpId: "",
    Titulo: "",
    clienteNombre: "",
    Descripcion: "",
    FechaInicio: "",
    FechaFin: "",
    Estado: "Programada"
  });

  // Leyenda de estados
  const leyendaEstados = [
    { estado: "Programada", color: "#00aae4", icono: "⏰" },
    { estado: "En progreso", color: "#f59e0b", icono: "🔄" },
    { estado: "Completada", color: "#16a34a", icono: "✅" },
    { estado: "Cancelada", color: "#dc2626", icono: "❌" }
  ];

  // Detectar si es móvil
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Función para calcular fechas de la semana de lunes a domingo
  const calcularFechasSemana = (fecha) => {
    const fechaObj = new Date(fecha);
    const dayOfWeek = fechaObj.getDay(); // 0=Domingo, 1=Lunes, etc.
    console.log('calcularFechasSemana ', fecha);
    // Ajuste para que la semana empiece en lunes (1)
    // Si es domingo (0), retrocedemos 6 días para llegar al lunes anterior
    // Si es lunes (1), no hay ajuste (diff = 0)
    // Si es martes (2), retrocedemos 1 día, etc.
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const primerDiaSemana = new Date(fechaObj);
    primerDiaSemana.setDate(fechaObj.getDate() + diffToMonday);
    primerDiaSemana.setHours(0, 0, 0, 0);

    const ultimoDiaSemana = new Date(primerDiaSemana);
    ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);
    ultimoDiaSemana.setHours(23, 59, 59, 999);

    return {
      semanaInicio: primerDiaSemana,
      semanaFin: ultimoDiaSemana
    };
  };

  // Inicializar fechas al cargar
  useEffect(() => {
    //const hoy = new Date();
    const obtenerHoyPeru = () => {
      const ahora = new Date();

      // Usar Intl.DateTimeFormat para obtener fecha de Perú
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const fechaStr = formatter.format(ahora); // Formato: YYYY-MM-DD
      const [anio, mes, dia] = fechaStr.split('-').map(Number);

      return new Date(anio, mes - 1, dia);
    };

    const hoy = obtenerHoyPeru();
    console.log('Inicializar ', hoy);
    const semana = calcularFechasSemana(hoy);
    console.log('semana ', semana);
    setFechasConsulta({
      diaSeleccionado: hoy,
      semanaInicio: semana.semanaInicio,
      semanaFin: semana.semanaFin
    });

    // Establecer ID inicial para hoy
    const hoyId = `fc-dom-${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    setDiaSeleccionadoId(hoyId);
  }, []);

  // Función para cargar estadísticas de ventas con fechas específicas
  const cargarEstadisticasVentas = async (fechaDia = null, fechaInicioSemana = null, fechaFinSemana = null) => {
    setIsLoadingVentas(true);
    try {
      // Usar fechas proporcionadas o las del estado
      const diaConsulta = fechaDia || fechasConsulta.diaSeleccionado;
      const inicioSemana = fechaInicioSemana || fechasConsulta.semanaInicio;
      const finSemana = fechaFinSemana || fechasConsulta.semanaFin;

      // Formatear fechas para la API
      const formatearFecha = (fecha) => {
        return fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      };

      const params = new URLSearchParams({
        dia: formatearFecha(diaConsulta),
        inicioSemana: formatearFecha(inicioSemana),
        finSemana: formatearFecha(finSemana)
      });

      const res = await fetch(`${BACKEND_URL}/api/estadisticas-ventas?${params}`);
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      const data = await res.json();

      // Formatear fecha para mostrar
      const formatearFechaBonita = (fecha) => {
        return fecha.toLocaleDateString('es-PE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      const formatearRangoSemana = (inicio, fin) => {
        const inicioStr = inicio.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
        const finStr = fin.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
        return `${inicioStr} - ${finStr}`;
      };

      setEstadisticasVentas({
        diaSeleccionado: {
          fecha: formatearFechaBonita(diaConsulta),
          total: data.hoy?.total || 0,
          efectivo: data.hoy?.efectivo || 0,
          yape: data.hoy?.yape || 0,
          plin: data.hoy?.plin || 0,
          citasCompletadas: data.hoy?.citasCompletadas || 0
        },
        semanaActual: {
          fechaInicio: formatearFechaBonita(inicioSemana),
          fechaFin: formatearFechaBonita(finSemana),
          rango: formatearRangoSemana(inicioSemana, finSemana),
          total: data.semana?.total || 0,
          efectivo: data.semana?.efectivo || 0,
          yape: data.semana?.yape || 0,
          plin: data.semana?.plin || 0,
          citasCompletadas: data.semana?.citasCompletadas || 0
        },
        totalGeneral: data.totalGeneral || 0
      });

    } catch (error) {
      console.error("❌ Error al cargar estadísticas de ventas:", error);
      // Inicializar con estructura completa
      const hoy = fechaDia || new Date();
      const semana = calcularFechasSemana(hoy);

      setEstadisticasVentas({
        diaSeleccionado: {
          fecha: hoy.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          total: 0,
          efectivo: 0,
          yape: 0,
          plin: 0,
          citasCompletadas: 0
        },
        semanaActual: {
          fechaInicio: semana.semanaInicio.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          fechaFin: semana.semanaFin.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          rango: `${semana.semanaInicio.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - ${semana.semanaFin.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}`,
          total: 0,
          efectivo: 0,
          yape: 0,
          plin: 0,
          citasCompletadas: 0
        },
        totalGeneral: 0
      });
    } finally {
      setIsLoadingVentas(false);
    }
  };

  // Cargar estadísticas cuando cambian las fechas
  useEffect(() => {
    cargarEstadisticasVentas();
  }, [fechasConsulta]);

  // Manejar cambio de vista del calendario
  const handleDatesSet = (dateInfo) => {
    console.log("📅 Vista del calendario cambiada:", dateInfo);

    // Obtener el primer día visible en la vista actual
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentView = calendarApi.view;
      const startDate = currentView.currentStart;
      const endDate = currentView.currentEnd;

      // Para vista de semana, usar el primer día visible
      if (currentView.type === 'timeGridWeek' || currentView.type === 'dayGridWeek') {
        const semana = calcularFechasSemana(startDate);

        // Actualizar estado con fechas de la semana visible
        setFechasConsulta(prev => ({
          ...prev,
          diaSeleccionado: startDate,
          semanaInicio: semana.semanaInicio,
          semanaFin: semana.semanaFin
        }));

        console.log("🔄 Semana visible:", {
          inicio: semana.semanaInicio.toLocaleDateString(),
          fin: semana.semanaFin.toLocaleDateString(),
          diaSeleccionado: startDate.toLocaleDateString()
        });
      }
      // Para vista de día
      else if (currentView.type === 'timeGridDay') {
        setFechasConsulta(prev => ({
          ...prev,
          diaSeleccionado: startDate,
          semanaInicio: startDate,
          semanaFin: startDate
        }));
      }
      // Para vista de mes
      else if (currentView.type === 'dayGridMonth') {
        // Usar el primer día del mes como referencia
        const primerDiaMes = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const semana = calcularFechasSemana(primerDiaMes);

        setFechasConsulta(prev => ({
          ...prev,
          diaSeleccionado: startDate,
          semanaInicio: semana.semanaInicio,
          semanaFin: semana.semanaFin
        }));
      }
    }
  };

  // Manejar clic en encabezado de día (SOLO actualiza estadísticas, NO cambia vista)
  const handleDayHeaderClick = (arg, element) => {
    console.log("🟢 Click en encabezado de día:", arg);

    const fechaClick = arg.date;
    const semana = calcularFechasSemana(fechaClick);

    // Generar ID único para el día seleccionado
    /*     const fechaId = `fc-dom-${fechaClick.getFullYear()}-${(fechaClick.getMonth() + 1).toString().padStart(2, '0')}-${fechaClick.getDate().toString().padStart(2, '0')}`;
     */
    const fechaId = `fc-dom-${fechaClick.getUTCFullYear()}-${(fechaClick.getUTCMonth() + 1).toString().padStart(2, '0')}-${fechaClick.getUTCDate().toString().padStart(2, '0')}`;
    console.log("🟢 Ta weon :", fechaId);
    // Remover selección anterior
    if (diaSeleccionadoId) {
      const prevElement = document.getElementById(diaSeleccionadoId);
      if (prevElement) {
        prevElement.classList.remove('bg-gray-800', 'text-white', 'font-bold');
        prevElement.classList.add('bg-gray-50', 'text-gray-700');
      }
    }

    // Aplicar estilo al nuevo día seleccionado
    if (element) {
      element.classList.remove('bg-gray-50', 'text-gray-700');
      element.classList.add('bg-gray-800', 'text-white', 'font-bold');
      setDiaSeleccionadoId(fechaId);
    }

    // Actualizar fechas de consulta (solo para estadísticas)
    setFechasConsulta({
      diaSeleccionado: fechaClick,
      semanaInicio: semana.semanaInicio,
      semanaFin: semana.semanaFin
    });

    console.log("📊 Estadísticas actualizadas para:", fechaClick.toLocaleDateString());
  };

  // Configurar listeners para encabezados de día después de que el calendario se monte
  useEffect(() => {
    const setupDayHeaders = () => {
      // Esperar a que el calendario se renderice
      setTimeout(() => {
        const dayHeaders = document.querySelectorAll('.fc-col-header-cell');

        dayHeaders.forEach(header => {
          // Remover listeners anteriores para evitar duplicados
          header.removeEventListener('click', handleHeaderClick);

          // Agregar nuevo listener
          header.addEventListener('click', function (e) {
            const dateStr = this.getAttribute('data-date');
            if (dateStr) {
              const date = new Date(dateStr);
              handleDayHeaderClick({ date }, this);
              e.stopPropagation(); // Prevenir comportamiento por defecto
            }
          });
        });

        // También para días en vista de mes
        const dayCells = document.querySelectorAll('.fc-daygrid-day');
        dayCells.forEach(cell => {
          cell.removeEventListener('click', handleDayCellClick);

          cell.addEventListener('click', function (e) {
            const dateStr = this.getAttribute('data-date');
            if (dateStr) {
              const date = new Date(dateStr);
              handleDayHeaderClick({ date }, this);
              e.stopPropagation();
            }
          });
        });
      }, 500); // Retraso para asegurar que el calendario esté renderizado
    };

    // Función auxiliar para manejar clics
    const handleHeaderClick = (e) => {
      const dateStr = e.currentTarget.getAttribute('data-date');
      if (dateStr) {
        const date = new Date(dateStr);
        handleDayHeaderClick({ date }, e.currentTarget);
        e.stopPropagation();
      }
    };

    const handleDayCellClick = (e) => {
      const dateStr = e.currentTarget.getAttribute('data-date');
      if (dateStr) {
        const date = new Date(dateStr);
        handleDayHeaderClick({ date }, e.currentTarget);
        e.stopPropagation();
      }
    };

    // Configurar inicialmente
    setupDayHeaders();

    // Reconfigurar cada vez que cambie la vista
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.on('datesSet', setupDayHeaders);
    }

    return () => {
      if (calendarApi) {
        calendarApi.off('datesSet', setupDayHeaders);
      }
    };
  }, []);

  // Aplicar estilos al día seleccionado cuando cambia
  useEffect(() => {
    if (diaSeleccionadoId) {
      // Limpiar selección anterior
      const allDayHeaders = document.querySelectorAll('.fc-col-header-cell, .fc-daygrid-day');
      allDayHeaders.forEach(el => {
        if (el.id !== diaSeleccionadoId) {
          el.classList.remove('bg-gray-800', 'text-white', 'font-bold');
          el.classList.add('bg-gray-50', 'text-gray-700');
        }
      });

      // Aplicar al nuevo seleccionado
      const selectedElement = document.getElementById(diaSeleccionadoId);
      if (selectedElement) {
        selectedElement.classList.remove('bg-gray-50', 'text-gray-700');
        selectedElement.classList.add('bg-gray-800', 'text-white', 'font-bold');
      }
    }
  }, [diaSeleccionadoId]);

  const handleEstadoChange = (e) => {
    const nuevoEstado = e.target.value;
    //setEstadoAnterior(form.Estado);
    setForm((prev) => ({ ...prev, Estado: nuevoEstado }));
  };

  const handleGuardarVenta = (datosVenta) => {
    console.log("✅ Venta registrada:", datosVenta);
    setIsVentaModalOpen(false);
    setModalCita(false);
    cargarCitas();
    cargarEstadisticasVentas(); // Recargar estadísticas después de guardar venta
  };

  const handleCloseVentaModal = () => {
    setIsVentaModalOpen(false);
    setModalCita(false);
  };

  const cargarCitas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/citas`);
      const data = await res.json();
      console.log("🧾 Datos crudos desde API:", data);

      const eventosConvertidos = data.map((cita) => {
        let startDate, endDate;
        startDate = new Date(cita.start.replace(' ', 'T'));
        endDate = new Date(cita.end.replace(' ', 'T'));

        console.log(`Fecha start original: ${cita.start}, convertida: ${startDate}`);
        console.log(`Fecha end original: ${cita.end}, convertida: ${endDate}`);

        if (isNaN(startDate.getTime())) {
          console.error("Fecha start inválida:", cita.start);
          startDate = new Date();
        }

        if (isNaN(endDate.getTime())) {
          console.error("Fecha end inválida:", cita.end);
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        }

        let backgroundColor = "#00aae4";
        if (cita.extendedProps.estado === "Programada") backgroundColor = "#00aae4";
        else if (cita.extendedProps.estado === "En progreso") backgroundColor = "#f59e0b";
        else if (cita.extendedProps.estado === "Completada") backgroundColor = "#16a34a";
        else if (cita.extendedProps.estado === "Cancelada") backgroundColor = "#dc2626";

        return {
          id: cita.id,
          title: cita.title,
          start: startDate,
          end: endDate,
          backgroundColor,
          borderColor: "#000000",
          textColor: "#fafbfd",
          extendedProps: {
            Descripcion: cita.descripcion,
            ClienteID: cita.extendedProps.clienteID,
            EmpId: cita.extendedProps.EmpId,
            ClienteNombre: cita.extendedProps.clienteNombre,
            EmpleadoNombre: cita.extendedProps.empleadoNombre,
            Estado: cita.extendedProps.estado,
          },
        };
      });

      setEventos(eventosConvertidos);
    } catch (error) {
      console.error("❌ Error al cargar citas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/clientes`);
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/listaempleado`);
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("❌ Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    cargarCitas();
    cargarClientes();
    cargarEmpleados();
    cargarEstadisticasVentas();
  }, []);

  const manejarClickCelda = (clickInfo) => {
    console.log("🟢 Click en celda:", clickInfo);
    const fechaClick = new Date(clickInfo.dateStr);
    const fechaFin = new Date(fechaClick);
    fechaFin.setHours(fechaFin.getHours() + 1);

    const formatoInput = (fecha) => {
      const pad = (num) => num.toString().padStart(2, '0');
      const año = fecha.getFullYear();
      const mes = pad(fecha.getMonth() + 1);
      const dia = pad(fecha.getDate());
      const horas = pad(fecha.getHours());
      const minutos = pad(fecha.getMinutes());
      return `${año}-${mes}-${dia}T${horas}:${minutos}`;
    };

    setForm({
      CitaID: null,
      ClienteID: "",
      EmpId: "",
      Titulo: "",
      Descripcion: "",
      clienteNombre: "",
      FechaInicio: formatoInput(fechaClick),
      FechaFin: formatoInput(fechaFin),
      Estado: "Programada",
      EstadoOriginal: "Programada"
    });

    setModalKey(prev => prev + 1);
    setModalCita(true);
  };

  const manejarClickEvento = (clickInfo) => {
    console.log("🟡 Click en evento:", clickInfo);
    const ev = clickInfo.event;
    const props = ev.extendedProps || {};

    setForm({
      CitaID: ev.id,
      Titulo: props.Titulo || ev.title || "",
      clienteNombre: props.ClienteNombre,
      Descripcion: props.Descripcion || "",
      FechaInicio: ev.startStr,
      FechaFin: ev.endStr || ev.startStr,
      ClienteID: props.ClienteID || "",
      EmpId: props.EmpId || "",
      Estado: props.Estado || "Programada",
      EstadoOriginal: props.Estado || "Programada",
    });

    console.log("📝 Formulario configurado para editar cita");
    setModalKey(prev => prev + 1);
    setModalCita(true);
  };

  const guardarCita = async (e) => {
    e.preventDefault();
    console.log("💾 Guardando cita:", form);

    try {
      if (!form.Titulo || !form.FechaInicio || !form.ClienteID) {
        alert("⚠️ Completa el título, la fecha y el cliente.");
        return;
      }

      if (form.Estado === "Completada") {
        setIsVentaModalOpen(true);
        return;
      }

      const metodo = form.CitaID ? "PUT" : "POST";
      const url = form.CitaID
        ? `${BACKEND_URL}/api/citas/${form.CitaID}`
        : `${BACKEND_URL}/api/citas`;

      const cuerpoCita = {
        ...form,
        title: form.Titulo,
        descripcion: form.Descripcion,
        start: form.FechaInicio,
        end: form.FechaFin,
        extendedProps: {
          clienteID: form.ClienteID,
          EmpId: form.EmpId,
          estado: form.Estado
        }
      };

      console.log("📤 Enviando datos:", cuerpoCita);

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpoCita),
      });

      if (!respuesta.ok) throw new Error("Error al guardar cita");

      const resultado = await respuesta.json();
      console.log("✅ Respuesta del servidor:", resultado);

      alert(form.CitaID ? "✅ Cita actualizada." : "✅ Cita registrada.");
      setModalCita(false);
      cargarCitas();
      cargarEstadisticasVentas();
    } catch (error) {
      console.error("❌ Error al guardar cita:", error);
      alert("❌ No se pudo registrar la cita.");
    }
  };

  const eliminarCita = async () => {
    if (!form.CitaID) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      try {
        await fetch(`${BACKEND_URL}/api/citas/${form.CitaID}`, {
          method: "DELETE"
        });
        setModalCita(false);
        cargarCitas();
        alert("✅ Cita eliminada correctamente.");
      } catch (error) {
        alert("❌ Error al eliminar la cita.");
      }
    }
  };

  // Componente para mostrar tarjetas de estadísticas
  const EstadisticasCard = ({ titulo, valor, icono, color, isLoading, subtitulo = null }) => {
    const displayValue = typeof valor === 'number' ? valor.toFixed(2) : '0.00';

    return (
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-600">{titulo}</p>
              {subtitulo && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {subtitulo}
                </span>
              )}
            </div>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-800 flex items-center gap-1">
                <span className="text-yellow-500 text-lg">S/</span>
                {displayValue}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icono}
          </div>
        </div>
      </div>
    );
  };

  // Botón para volver al día actual
  const BotonHoy = () => (
    <button
      onClick={() => {
        const hoy = new Date();
        const semana = calcularFechasSemana(hoy);
        const hoyId = `fc-dom-${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;

        setFechasConsulta({
          diaSeleccionado: hoy,
          semanaInicio: semana.semanaInicio,
          semanaFin: semana.semanaFin
        });

        setDiaSeleccionadoId(hoyId);

        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
          calendarApi.today();
        }
      }}
      className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 text-sm"
    >
      <FaCalendarDay />
      Hoy
    </button>
  );

  // Función para formatear fecha corta
  const formatearFechaCorta = (fecha) => {
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-6">
      {/* Header ultra compacto */}
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-3 border border-blue-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <FaCalendarAlt className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Agenda de Citas</h1>
              <p className="text-gray-600 text-xs">Horario: 9:00 AM - 11:00 PM</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BotonHoy />
            <button
              onClick={() => {
                cargarCitas();
                cargarEstadisticasVentas();
              }}
              disabled={isLoading || isLoadingVentas}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FaSyncAlt className={`${isLoading ? 'animate-spin' : ''}`} />
              {isLoading || isLoadingVentas ? "Cargando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {/* Leyenda de estados - CENTRADA */}
        <div className="flex justify-center mt-3">
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            {leyendaEstados.map((item) => (
              <div key={item.estado} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-gray-700 flex items-center gap-1">
                  <span className="text-[10px]">{item.icono}</span>
                  <span className="hidden sm:inline">{item.estado}</span>
                  <span className="sm:hidden">
                    {item.estado === "Programada" ? "Prog." :
                      item.estado === "En progreso" ? "Progreso" :
                        item.estado === "Completada" ? "Comp." : "Canc."}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de Estadísticas de Ventas */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaChartLine className="text-green-500 text-xl" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">Estadísticas de Ventas</h2>
              <p className="text-xs text-gray-500">
                Día seleccionado: {formatearFechaCorta(fechasConsulta.diaSeleccionado)} |
                Semana: {formatearFechaCorta(fechasConsulta.semanaInicio)} - {formatearFechaCorta(fechasConsulta.semanaFin)}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full hidden sm:block">
            Haz clic en cualquier día del calendario para ver sus estadísticas
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <EstadisticasCard
            titulo="Ventas del Día"
            subtitulo={formatearFechaCorta(fechasConsulta.diaSeleccionado)}
            valor={estadisticasVentas.diaSeleccionado.total}
            icono={<FaMoneyBillWave className="text-green-500 text-xl" />}
            color="bg-green-50"
            isLoading={isLoadingVentas}
          />

          <EstadisticasCard
            titulo="Ventas Semana"
            subtitulo={`${formatearFechaCorta(fechasConsulta.semanaInicio)} - ${formatearFechaCorta(fechasConsulta.semanaFin)}`}
            valor={estadisticasVentas.semanaActual.total}
            icono={<FaWallet className="text-blue-500 text-xl" />}
            color="bg-blue-50"
            isLoading={isLoadingVentas}
          />

          <EstadisticasCard
            titulo="Citas Completadas"
            subtitulo="Día seleccionado"
            valor={estadisticasVentas.diaSeleccionado.citasCompletadas}
            icono={<FaCalendarAlt className="text-purple-500 text-xl" />}
            color="bg-purple-50"
            isLoading={isLoadingVentas}
          />

          <EstadisticasCard
            titulo="Total General"
            subtitulo="Acumulado"
            valor={estadisticasVentas.totalGeneral}
            icono={<FaCreditCard className="text-yellow-500 text-xl" />}
            color="bg-yellow-50"
            isLoading={isLoadingVentas}
          />
        </div>

        {/* Métodos de Pago */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-700">Métodos de Pago - Día Seleccionado</h3>
            <span className="text-xs text-gray-500">{formatearFechaCorta(fechasConsulta.diaSeleccionado)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Efectivo */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <BsCashCoin className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Efectivo</p>
                  <p className="font-bold text-gray-800">
                    S/ {(estadisticasVentas.diaSeleccionado.efectivo || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                Semana: S/ {(estadisticasVentas.semanaActual.efectivo || 0).toFixed(2)}
              </span>
            </div>

            {/* Yape */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <BsPhone className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Yape</p>
                  <p className="font-bold text-gray-800">
                    S/ {(estadisticasVentas.diaSeleccionado.yape || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                Semana: S/ {(estadisticasVentas.semanaActual.yape || 0).toFixed(2)}
              </span>
            </div>

            {/* Plin */}
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <BsPhone className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Plin</p>
                  <p className="font-bold text-gray-800">
                    S/ {(estadisticasVentas.diaSeleccionado.plin || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                Semana: S/ {(estadisticasVentas.semanaActual.plin || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-auto">
        <div className="min-w-[1200px]">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridWeek"
            selectable={false}
            dateClick={manejarClickCelda}
            datesSet={handleDatesSet}
            events={eventos}
            eventClick={manejarClickEvento}
            timeZone='America/Lima'
            timeZoneParam='UTC'
            nowIndicator={true}
            height="auto"
            slotMinTime="09:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            locale={esLocale}
            firstDay={1}
            displayEventTime={true}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              meridiem: 'short'
            }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              meridiem: 'short'
            }}
            buttonText={{
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              list: "Lista",
            }}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            views={{
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' },
                dayMaxEvents: 3,
                fixedWeekCount: false,
                dateClick: manejarClickCelda,
                dayHeaderClassNames: "cursor-pointer hover:bg-gray-200 transition-colors",
                dayCellClassNames: "cursor-pointer hover:bg-gray-100 transition-colors"
              },
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                slotLabelFormat: {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  meridiem: 'short'
                },
                slotDuration: '00:30:00',
                slotLabelInterval: '01:00:00',
                allDaySlot: false,
                expandRows: true,
                dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'short' },
                dateClick: manejarClickCelda,
                dayHeaderClassNames: "cursor-pointer hover:bg-gray-200 transition-colors",
                slotEventOverlap: false,
                slotHeight: 60,
                contentHeight: 'auto',
                dayMinHeight: 120,
                dayMaxEvents: true,
                moreLinkClick: "popover",
                eventPositioned: (info) => {
                  const eventEl = info.el;
                  if (eventEl) {
                    eventEl.style.position = 'absolute';
                    eventEl.style.top = '0px';
                  }
                }
              },
              timeGridDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                slotDuration: '00:30:00',
                slotLabelInterval: '01:00:00',
                dateClick: manejarClickCelda,
                slotEventOverlap: false,
                slotHeight: 60,
                contentHeight: 'auto',
                dayMinHeight: 120,
                dayHeaderClassNames: "cursor-pointer hover:bg-gray-200 transition-colors"
              },
              listWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                listDayFormat: {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                },
                listDaySideFormat: false
              }
            }}
            eventMaxStack={2}
            eventOrder="start,title"
            eventOverlap={false}
            slotEventOverlap={false}
            eventConstraint={{
              startTime: '09:00',
              endTime: '23:00'
            }}
            eventContent={(arg) => {
              const empleado = arg.event.extendedProps?.EmpleadoNombre || "";
              const titulo = arg.event.title || "";
              const cliente = arg.event.extendedProps?.ClienteNombre || "";
              const estado = arg.event.extendedProps?.Estado || "";
              const horaInicio = arg.timeText || "";

              const iconoEstado = {
                'Programada': '⏰',
                'En progreso': '🔄',
                'Completada': '✅',
                'Cancelada': '❌'
              }[estado] || '📅';

              return (
                <div className="p-1 text-left h-full overflow-hidden flex flex-col justify-start gap-0.5 leading-tight bg-opacity-90 hover:bg-opacity-100 transition-all duration-150">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] flex-shrink-0">{iconoEstado}</span>
                    <div className="font-bold text-white text-[12px] leading-tight truncate flex-1 
                tracking-tight antialiased">
                      {titulo}
                    </div>
                  </div>

                  {cliente && (
                    <div className="text-white text-[10px] leading-tight flex items-center gap-1">
                      <span className="text-[8px] flex-shrink-0">👤</span>
                      <span className="truncate flex-1">{cliente}</span>
                    </div>
                  )}
                  {horaInicio && (
                    <div className="text-white text-[10px] leading-tight flex items-center gap-1">
                      <span className="text-[8px] flex-shrink-0">🕒</span>
                      <span className="fruncate flex-1">{horaInicio} </span>
                    </div>
                  )}
                </div>
              );
            }}
            eventClassNames="border-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer mx-0.5 mb-0.5 align-top"
            dayHeaderClassNames="bg-gray-50 text-gray-700 font-semibold text-sm py-2 cursor-pointer hover:bg-gray-200 transition-colors"
            slotLabelClassNames="text-gray-600 font-medium text-[15px] py-2"
            slotHeight={6000}
            expandRows={true}
            contentHeight="auto"
            eventMargin={1}
            //dayCellClassNames="min-h-[60px] cursor-pointer hover:bg-gray-100 transition-colors"
            eventDisplay="block"
            eventMinHeight={40}
            //eventShortHeight={40}
            eventDidMount={(info) => {
              const eventEl = info.el;
              if (eventEl) {
                eventEl.style.position = 'absolute';
                eventEl.style.top = '1px';
                eventEl.style.left = '2px';
                eventEl.style.right = '2px';
                eventEl.style.bottom = '1px';
              }
            }}
          />
        </div>
      </div>

      {/* Botón flotante para móvil */}
      {isMobile && (
        <button
          onClick={() => {
            const ahora = new Date();
            const fechaInicio = ahora.toISOString().slice(0, 16);
            const fechaFin = new Date(ahora.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);

            setForm({
              CitaID: null,
              ClienteID: "",
              EmpId: "",
              Titulo: "",
              Descripcion: "",
              clienteNombre: "",
              FechaInicio: fechaInicio,
              FechaFin: fechaFin,
              Estado: "Programada",
              EstadoOriginal: "Programada"
            });
            setModalKey(prev => prev + 1);
            setModalCita(true);
          }}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 z-40"
        >
          <FaPlus className="text-xl" />
        </button>
      )}

      {/* Modales */}
      <ModalCita
        key={modalKey}
        modalCita={modalCita}
        setModalCita={setModalCita}
        form={form}
        setForm={setForm}
        guardarCita={guardarCita}
        eliminarCita={eliminarCita}
        clientes={clientes}
        Empleados={Empleados}
        setModalCliente={setModalCliente}
        handleEstadoChange={handleEstadoChange}
      />

      <ModalVenta
        isOpen={isVentaModalOpen}
        onClose={handleCloseVentaModal}
        onRequestClose={handleCloseVentaModal}
        citaInfo={form}
        onSave={handleGuardarVenta}
      />

      <ModalCliente
        isOpen={modalCliente}
        onClose={() => setModalCliente(false)}
        recargarClientes={cargarClientes}
      />

      {/* Loading Overlay */}
      {(isLoading || isLoadingVentas) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
            <FaSyncAlt className="animate-spin text-blue-500 text-xl" />
            <span className="text-gray-700 font-medium">Cargando...</span>
          </div>
        </div>
      )}
    </div>
  );
}