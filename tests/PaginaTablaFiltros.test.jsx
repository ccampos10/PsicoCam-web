
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaginaTabla } from "../src/components/PaginaTabla/PaginaTabla";

const datos = [
  {
    id: 1,
    box: "Box 1",
    fecha: "2026-09-15",
    categoria: "RS",
    nivel: "Alto",
  },
  {
    id: 2,
    box: "Box 2",
    fecha: "2026-09-16",
    categoria: "VD",
    nivel: "Medio",
  },
  {
    id: 3,
    box: "Box 10",
    fecha: "2026-09-15",
    categoria: "VD",
    nivel: "Bajo",
  },
];

const columnas = [
  { clave: "box", encabezado: "Box" },
  { clave: "fecha", encabezado: "Fecha" },
  { clave: "categoria", encabezado: "Categoría" },
  { clave: "nivel", encabezado: "Nivel" },
];

const filtros = [
  {
    clave: "box",
    etiqueta: "Buscar box",
    tipo: "texto",
  },
  {
    clave: "fecha",
    etiqueta: "Fecha",
    tipo: "fecha",
  },
  {
    clave: "categoria",
    etiqueta: "Categoría",
    opciones: ["RS", "VD"],
  },
];

describe("SCRUM-603 - Nuevos filtros PaginaTabla", () => {
  it("muestra filtros de texto, fecha y categoría", () => {
    render(
      <PaginaTabla
        datos={datos}
        columnas={columnas}
        filtros={filtros}
      />
    );

    expect(screen.getByLabelText("Buscar box").type).toBe("text");
    expect(screen.getByLabelText("Fecha").type).toBe("date");
    expect(screen.getByLabelText("Categoría").tagName).toBe("SELECT");
  });

  it("filtra texto sin distinguir mayúsculas", () => {
    render(
      <PaginaTabla
        datos={datos}
        columnas={columnas}
        filtros={filtros}
      />
    );

    fireEvent.change(screen.getByLabelText("Buscar box"), {
      target: { value: "box 2" },
    });

    expect(screen.getByText("Box 2")).toBeTruthy();
    expect(screen.queryByText("Box 1")).toBeNull();
    expect(screen.queryByText("Box 10")).toBeNull();
  });

  it("filtra registros por fecha", () => {
    render(
      <PaginaTabla
        datos={datos}
        columnas={columnas}
        filtros={filtros}
      />
    );

    fireEvent.change(screen.getByLabelText("Fecha"), {
      target: { value: "2026-09-16" },
    });

    expect(screen.getByText("Box 2")).toBeTruthy();
    expect(screen.queryByText("Box 1")).toBeNull();
  });

  it("mantiene funcionando los filtros de categoría", () => {
    render(
      <PaginaTabla
        datos={datos}
        columnas={columnas}
        filtros={filtros}
      />
    );

    fireEvent.change(screen.getByLabelText("Categoría"), {
      target: { value: "RS" },
    });

    expect(screen.getByText("Box 1")).toBeTruthy();
    expect(screen.queryByText("Box 2")).toBeNull();
  });

  it("permite combinar diferentes filtros", () => {
    render(
      <PaginaTabla
        datos={datos}
        columnas={columnas}
        filtros={filtros}
      />
    );

    fireEvent.change(screen.getByLabelText("Buscar box"), {
      target: { value: "box 1" },
    });

    fireEvent.change(screen.getByLabelText("Fecha"), {
      target: { value: "2026-09-15" },
    });

    fireEvent.change(screen.getByLabelText("Categoría"), {
      target: { value: "RS" },
    });

    expect(screen.getByText("Box 1")).toBeTruthy();
    expect(screen.queryByText("Box 10")).toBeNull();
    expect(screen.queryByText("Box 2")).toBeNull();
  });

  it("entrega los valores a la página mediante callback", () => {
    const onFiltrosChange = vi.fn();

    render(
      <PaginaTabla
        datos={datos}
        columnas={columnas}
        filtros={filtros}
        onFiltrosChange={onFiltrosChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Buscar box"), {
      target: { value: "Box 1" },
    });

    expect(onFiltrosChange).toHaveBeenCalledWith({
      box: "Box 1",
    });
  });

  it("restaura los registros al limpiar los filtros", () => {
    render(
      <PaginaTabla
        datos={datos}
        columnas={columnas}
        filtros={filtros}
      />
    );

    const campo = screen.getByLabelText("Buscar box");

    fireEvent.change(campo, {
      target: { value: "Box 2" },
    });

    expect(screen.queryByText("Box 1")).toBeNull();

    fireEvent.change(campo, {
      target: { value: "" },
    });

    expect(screen.getByText("Box 1")).toBeTruthy();
    expect(screen.getByText("Box 2")).toBeTruthy();
    expect(screen.getByText("Box 10")).toBeTruthy();
  });
});
