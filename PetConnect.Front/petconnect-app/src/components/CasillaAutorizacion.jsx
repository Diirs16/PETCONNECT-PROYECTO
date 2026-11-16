import { ExternalLink } from "lucide-react";
import { CORREO_ATENCION } from "../utils/contacto";

// Casilla de autorización de datos (Ley 1581, arts. 9 y 12; ítems 3.1 y 3.5).
// Textos B.1 (casilla) y B.2 (aviso corto) de
// Documentacion/Legal/POLITICA-TRATAMIENTO-DATOS-v1.0-BORRADOR.md.
// Es el ÚNICO lugar de la web con este texto legal: lo usan el registro
// (RegisterModal.jsx) y el inicio de sesión de cuentas sin autorización vigente
// (LoginModal.jsx). Si cambia el texto, cambia también el .md y sube la versión
// de la política (PoliticaDatos.jsx y VERSION_POLITICA_DATOS en api.py).
//
// La casilla la controla quien la usa (checked + onChange) y debe empezar SIN
// marcar. `ref` permite mover el foco a la casilla cuando falta marcarla.
//
// Fase 9 del rediseño (D9.7): solo colores de los tokens; el texto que se ve no
// cambia. El correo de B.2 sale de utils/contacto.js (mismo correo, mismo punto final).
export default function CasillaAutorizacion({ id, name, checked, onChange, ref }) {
  const idAviso = `${id}-aviso`;
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          aria-describedby={idAviso}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-marca"
        />
        <label htmlFor={id} className="min-h-11 cursor-pointer text-base leading-snug text-tinta">
          Soy mayor de 18 años, he leído la{" "}
          <a
            href="/politica-de-datos"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-marca underline underline-offset-2 hover:text-marca-hover"
          >
            Política de tratamiento de datos personales
            <ExternalLink className="ml-0.5 -mt-0.5 inline h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>{" "}
          y autorizo a PetConnect a tratar mis datos para crear y usar mi cuenta.
        </label>
      </div>
      <p id={idAviso} className="mt-2 pl-8 text-sm leading-relaxed text-tinta-suave">
        Usaremos tu nombre y tu correo para crear tu cuenta y enviarte códigos de verificación.
        Puedes conocer, actualizar, rectificar o borrar tus datos y revocar este permiso
        escribiendo a{" "}
        {/* Correo de atención del proyecto (D.1, 06/11/2026), desde utils/contacto.js */}
        <span className="break-words font-semibold text-tinta">{CORREO_ATENCION}.</span>
      </p>
    </div>
  );
}
