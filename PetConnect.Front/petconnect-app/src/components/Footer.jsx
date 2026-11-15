import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import { CIUDAD, CORREO_ATENCION } from "../utils/contacto";

// Fase 2 del rediseño. Antes:
//  - los enlaces eran <a href>: recargaban toda la página y vaciaban el carrito (#4);
//  - el contacto era inventado (teléfono y "Bogotá") (#3);
//  - los títulos eran h4 en mayúsculas sostenidas y el año decía 2025 (#42).
// Colores: solo los tokens "noche-*" de index.css, comprobados sobre el fondo noche.

const enlaces = [
  { to: "/catalogo", label: "Catálogo" },
  { to: "/adopcion", label: "Adopción" },
  { to: "/contacto", label: "Contacto" },
  { to: "/politica-de-datos", label: "Política de datos personales" },
];

// Receta de enlace del pie: 44 px de alto en celular (dedo), más compacto en
// escritorio; foco en noche-marca porque el foco general no se ve sobre noche.
const enlacePie =
  "inline-flex min-h-11 items-center rounded-control text-noche-texto no-underline underline-offset-4 hover:text-papel hover:underline focus-visible:outline-noche-marca md:min-h-9";

const tituloPie = "mb-2 text-sm font-semibold text-papel";

const [usuarioCorreo, dominioCorreo] = CORREO_ATENCION.split("@");

export default function Footer() {
  // El año sale del reloj del visitante: no se queda viejo cada enero.
  const anio = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-noche text-noche-texto">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 md:px-6 md:pt-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_auto] md:gap-12">
          <div className="sm:col-span-2 md:col-span-1">
            <p className="flex items-center gap-2">
              <img src="/logo.svg" alt="" className="h-8 w-8" />
              <span className="font-display text-xl leading-none">
                <span className="text-noche-marca">Pet </span>
                <span className="text-noche-acento">Connect</span>
              </span>
            </p>
            <p className="mt-4 max-w-[38ch] text-base text-pretty">
              Productos para cuidar a tu mascota y mascotas que buscan familia
              en el Quindío, en un solo lugar.
            </p>
          </div>

          <nav aria-labelledby="pie-enlaces">
            <h2 id="pie-enlaces" className={tituloPie}>
              Explora
            </h2>
            <ul className="m-0 list-none p-0 text-base">
              {enlaces.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className={enlacePie}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={tituloPie}>Contacto</h2>
            <ul className="m-0 list-none p-0 text-base">
              <li>
                <a
                  href={`mailto:${CORREO_ATENCION}`}
                  className={`${enlacePie} gap-2 wrap-anywhere`}
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {/* <wbr> = "aquí se puede partir": en celulares angostos el
                      correo baja de línea antes de la @ y no en medio de "gmail" */}
                  <span>
                    {usuarioCorreo}
                    <wbr />@{dominioCorreo}
                  </span>
                </a>
              </li>
              <li className="flex min-h-11 items-center gap-2 md:min-h-9">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {CIUDAD}
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-noche-texto/20 pt-6 text-sm">
          &copy; {anio} PetConnect. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
