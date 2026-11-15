import { ChevronDown, LoaderCircle } from "lucide-react";

// Ítem 4.17 (NC-003): botón al final de un listado que se carga por páginas.
// No se muestra si ya no hay más. Mientras carga queda desactivado (un clic
// doble no pide dos veces) y, si falla, avisa sin borrar lo que ya se ve.
// Fase 3 del rediseño: colores de los tokens y sin "btn-hover" (hacía subir el
// botón). Desactivado conserva su color (sin opacidad) para seguir legible.
export default function BotonVerMas({ hayMas, cargando, error, onVerMas, texto = "Ver más" }) {
  if (!hayMas) return null;

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      {error && (
        <p role="alert" className="text-sm text-error">
          No pudimos cargar más. Revisa tu conexión e inténtalo de nuevo.
        </p>
      )}
      <button
        type="button"
        onClick={onVerMas}
        disabled={cargando}
        aria-busy={cargando}
        className="presionable inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border-2 border-marca bg-superficie px-6 text-base font-semibold text-marca hover:bg-marca-claro disabled:cursor-wait disabled:hover:bg-superficie sm:w-auto"
      >
        {cargando ? (
          <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
        {cargando ? "Cargando…" : texto}
      </button>
    </div>
  );
}
