import { Info } from "lucide-react";
// Correo de atención de la política de datos (D.1), en un solo lugar desde la Fase 2.
// Fase 6 del rediseño: antes este archivo tenía su propia copia.
import { CORREO_ATENCION } from "../utils/contacto";

/**
 * Aviso para los formularios que todavía NO envían nada (ítem 3.2, A-21).
 * La página debe bloquear sus campos (<fieldset disabled>) y enlazar este aviso
 * con aria-describedby={id}, para que el lector de pantalla lo lea con el formulario.
 * Si recibe "invitacion", agrega una línea con el correo de atención como alternativa real.
 * Fase 6 del rediseño: colores de los tokens (aviso sobre aviso-claro, el mismo par del
 * aviso "Actualizamos tu carrito"), sin los ámbar de Tailwind a mano. Textos y comportamiento iguales.
 */
export default function AvisoDemo({ id, titulo, children, invitacion }) {
  return (
    <div
      id={id}
      role="note"
      className="flex gap-3 rounded-control border border-aviso/25 bg-aviso-claro p-4 text-sm text-aviso"
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">{titulo}</p>
        <p>{children}</p>
        {invitacion && (
          <p>
            {invitacion}{" "}
            <a
              href={`mailto:${CORREO_ATENCION}`}
              className="break-all font-medium text-aviso underline underline-offset-2 hover:no-underline"
            >
              {CORREO_ATENCION}
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
