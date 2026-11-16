import { useEffect, useSyncExternalStore } from "react";
import { CircleCheck, Info } from "lucide-react";
import { DURACION_AVISO_MS, leerAviso, limpiarAviso, suscribirAviso } from "../utils/avisoCarrito";

// Fase 5 del rediseño (#19): zona de aviso del carrito, montada una sola vez en
// App.jsx. La caja role="status" SIEMPRE existe (vacía hasta que hay algo que
// decir): así el lector de pantalla la conoce antes del texto y lo anuncia.
// El nombre del producto se pinta como texto de React, nunca como HTML (6.4).
// Sin animación propia: aparece y desaparece (solo hay dos movimientos, §3.4).
//
// En celular va abajo (cerca del pulgar); desde 640 px, arriba a la derecha,
// debajo del encabezado.

export default function AvisoCarrito() {
  const aviso = useSyncExternalStore(suscribirAviso, leerAviso);

  useEffect(() => {
    if (!aviso.titulo) return undefined;
    const reloj = setTimeout(() => limpiarAviso(aviso.n), DURACION_AVISO_MS);
    return () => clearTimeout(reloj);
  }, [aviso]);

  const Icono = aviso.tipo === "exito" ? CircleCheck : Info;

  return (
    <div
      role="status"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex justify-center sm:inset-x-auto sm:top-20 sm:right-6 sm:bottom-auto"
    >
      {aviso.titulo && (
        // key: con un aviso nuevo (aunque diga lo mismo) se cambia el nodo y el
        // lector lo vuelve a anunciar.
        <div
          key={aviso.n}
          className="flex w-full max-w-sm items-start gap-3 rounded-control bg-noche px-4 py-3 text-papel shadow-elevada"
        >
          <Icono
            className={`mt-0.5 h-5 w-5 shrink-0 ${aviso.tipo === "exito" ? "text-noche-marca" : "text-noche-texto"}`}
            aria-hidden="true"
          />
          <p className="min-w-0 text-sm">
            <span className="block font-semibold">{aviso.titulo}</span>
            {/* Pausa para el lector de pantalla entre el título y el nombre */}
            {aviso.nombre && <span className="sr-only">: </span>}
            {aviso.nombre && (
              <span className="mt-0.5 line-clamp-2 break-words text-noche-texto">{aviso.nombre}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
