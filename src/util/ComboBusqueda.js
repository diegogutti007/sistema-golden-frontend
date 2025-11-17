import React from "react";
import Select from "react-select";

export default function ComboBusqueda({ opciones, onSeleccionar, valorActual, placeholder }) {
  return (
    <div >
      <Select
        value={valorActual}
        options={opciones}
        onChange={onSeleccionar}
        placeholder={placeholder || "Seleccionar..."}
        isSearchable
        className="w-full"
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: "white",
            borderColor: state.isFocused ? "#6366f1" : "#d1d5db", // azul tailwind focus:ring-indigo-500
            boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.3)" : "none",
            "&:hover": { borderColor: "#6366f1" },
            borderRadius: "0.5rem",
            minHeight: "42px",
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
          }),
          menu: (base) => ({
            ...base,
            borderRadius: "0.5rem",
            overflow: "hidden",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }),
        }}
      />
    </div>
  );
}
