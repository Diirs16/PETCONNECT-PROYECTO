import { Inbox, LoaderCircle, RotateCw, TriangleAlert } from "lucide-react";

// Ítem 3.3 (A-23, NC-009): antes, si la API fallaba, la web mostraba mascotas y
// productos inventados. Ahora cada página muestra uno de estos tres estados:
//   - "cargando": mientras llega la respuesta (role="status": el lector de
//     pantalla lo anuncia sin interrumpir).
//   - "error": la API no respondió (role="alert") + botón "Reintentar".
//   - "vacio": la API respondió bien, pero no hay nada que mostrar.
// "accion" es opcional: un enlace extra, por ejemplo "Volver a adopción".
// "encabezado" es opcional: "h1" cuando el estado ocupa toda la página (las
// fichas), para que la página siga teniendo su título principal.
// Fase 3 del rediseño: colores de los tokens (index.css), sin grises a mano.
// El texto va en tinta / tinta-suave (≥ 5,8:1); el rojo de error solo en el
// borde y el ícono, para que el mensaje se lea cómodo.
const ESTILOS = {
  cargando: "border-borde bg-superficie",
  error: "border-error/40 bg-superficie",
  vacio: "border-borde bg-superficie",
};

const COLOR_ICONO = { cargando: "text-marca", error: "text-error", vacio: "text-tinta-suave" };

const ICONOS = { cargando: LoaderCircle, error: TriangleAlert, vacio: Inbox };

// Pendiente de la Fase 2: con encabezado="h1" (404 y fichas) el título se ve
// como título de página; antes salía a 16 px y la 404 tenía "jerarquía plana".
const ESTILO_TITULO = {
  h1: "font-display text-2xl font-normal text-balance md:text-3xl",
  normal: "text-base font-semibold",
};

export default function EstadoCarga({ tipo, titulo, children, onReintentar, accion, encabezado }) {
  const Icono = ICONOS[tipo];
  const Titulo = encabezado ?? "p";
  const esH1 = encabezado === "h1";

  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`mx-auto flex flex-col items-center gap-3 rounded-tarjeta border px-5 py-10 text-center ${esH1 ? "max-w-lg" : "max-w-md"} ${ESTILOS[tipo]}`}
    >
      <Icono
        className={`h-8 w-8 ${COLOR_ICONO[tipo]} ${tipo === "cargando" ? "motion-safe:animate-spin" : ""}`}
        aria-hidden="true"
      />
      <Titulo className={`text-tinta ${esH1 ? ESTILO_TITULO.h1 : ESTILO_TITULO.normal}`}>
        {titulo}
      </Titulo>
      {children && <p className="text-base text-pretty text-tinta-suave">{children}</p>}
      {(onReintentar || accion) && (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {onReintentar && (
            <button
              type="button"
              onClick={onReintentar}
              className="presionable inline-flex min-h-11 items-center gap-2 rounded-control bg-marca px-5 text-base font-semibold text-superficie hover:bg-marca-hover"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Reintentar
            </button>
          )}
          {accion}
        </div>
      )}
    </div>
  );
}
