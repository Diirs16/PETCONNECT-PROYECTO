import { useEffect, useRef } from "react";
import { ChevronDown, LoaderCircle } from "lucide-react";

// Ítem 4.17 (NC-003): botón al final de un listado que se carga por páginas.
// No se muestra si ya no hay más. Mientras carga no pide dos veces (un clic
// doble no repite la página) y, si falla, avisa sin borrar lo que ya se ve.
// Fase 3 del rediseño: colores de los tokens y sin "btn-hover" (hacía subir el
// botón). Desactivado conserva su color (sin opacidad) para seguir legible.
//
// Fase 12 (D12.4): antes, con teclado, el foco caía al <body> al pulsarlo.
// - Mientras carga usa aria-disabled en vez de disabled: un botón desactivado
//   pierde el foco; con aria-disabled lo conserva y el lector oye "Cargando…".
//   Si la carga falla, el foco sigue aquí y se lee el aviso de error.
// - Cuando llegan elementos nuevos, el foco pasa al primer enlace del primer
//   elemento nuevo, para seguir leyendo donde empieza lo que se agregó.
// listaRef: referencia al contenedor de la lista (cada hijo es un elemento).
const ENFOCABLE = 'a[href]:not([tabindex="-1"]), button:not([disabled])';

export default function BotonVerMas({ hayMas, cargando, error, onVerMas, texto = "Ver más", listaRef }) {
  const botonRef = useRef(null);
  const antesRef = useRef(null); // cuántos elementos había al pulsar (null = nada pendiente)

  // Corre cuando termina la carga (con la lista ya dibujada).
  useEffect(() => {
    if (cargando || antesRef.current === null) return;
    const antes = antesRef.current;
    antesRef.current = null;
    if (error) return;
    const lista = listaRef?.current;
    const destino = lista?.children[antes]?.querySelector(ENFOCABLE);
    if (destino) {
      destino.focus();
      return;
    }
    // Nada nuevo que enfocar (por ejemplo, un filtro del catálogo lo oculta): si el
    // botón sigue, el foco se queda en él; si ya no hay más, va al último elemento.
    if (botonRef.current?.isConnected) return;
    const enlaces = lista?.querySelectorAll(ENFOCABLE);
    enlaces?.[enlaces.length - 1]?.focus();
  }, [cargando, error, listaRef]);

  if (!hayMas) return null;

  function pulsar() {
    if (cargando) return;
    antesRef.current = listaRef?.current?.children.length ?? 0;
    onVerMas();
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      {error && (
        <p role="alert" className="text-sm text-error">
          No pudimos cargar más. Revisa tu conexión e inténtalo de nuevo.
        </p>
      )}
      <button
        ref={botonRef}
        type="button"
        onClick={pulsar}
        aria-disabled={cargando || undefined}
        aria-busy={cargando}
        className="presionable inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border-2 border-marca bg-superficie px-6 text-base font-semibold text-marca hover:bg-marca-claro aria-disabled:cursor-wait aria-disabled:hover:bg-superficie sm:w-auto"
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
