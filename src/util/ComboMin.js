import React from "react";
import Select from "react-select";

export default function ComboMin({ opciones, onSeleccionar, valorActual, placeholder }) {

  const customStyles = {
    container: (base) => ({
      ...base,
      zIndex: 999999,    // evita clipping dentro del modal
    }),
    control: (base, state) => ({
      ...base,
      backgroundColor: "white",
      borderColor: state.isFocused ? "#6366f1" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.3)" : "none",
      "&:hover": { borderColor: "#6366f1" },
      borderRadius: "0.5rem",
      minHeight: "34px",
      cursor: "pointer",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 999999,     // 🔥 clave para que salga encima del modal
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
      zIndex: 999999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
          ? "#e0e7ff"
          : "white",
      color: state.isSelected ? "white" : "#111827",
      cursor: "pointer",
      padding: "8px",
    }),
  };

  return (
    <div className="w-full">
      <Select
        value={valorActual}
        options={opciones}
        onChange={onSeleccionar}
        placeholder={placeholder || "Seleccionar..."}
        isSearchable
        className="w-full"
        styles={customStyles}
        menuPortalTarget={document.body}   // 🔥 saca el menú fuera del modal
      />
    </div>
  );
}
