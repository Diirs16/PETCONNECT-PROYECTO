import { Link } from "react-router-dom";
import EstadoCarga from "../components/EstadoCarga";

// Página 404 (hallazgo #22): antes, una dirección que no existe mostraba el
// encabezado y el pie con el centro vacío.
// EstadoCarga todavía tiene su estilo gris: recibe los tokens en la Fase 3.3.

const enlace =
  "presionable inline-flex min-h-11 items-center rounded-control px-5 text-base font-semibold no-underline";

export default function NoEncontrada() {
  return (
    <section className="px-4 py-12 md:px-6 md:py-20">
      {/* React 19 sube <title> y <meta> al <head> mientras esta página está abierta */}
      <title>Página no encontrada · PetConnect</title>
      <meta name="robots" content="noindex" />

      <EstadoCarga
        tipo="vacio"
        encabezado="h1"
        titulo="No encontramos esta página"
        accion={
          <>
            <Link to="/" className={`${enlace} bg-marca text-superficie hover:bg-marca-hover`}>
              Ir al inicio
            </Link>
            <Link
              to="/adopcion"
              className={`${enlace} border border-borde-fuerte text-tinta hover:border-acento hover:text-acento`}
            >
              Ver mascotas en adopción
            </Link>
          </>
        }
      >
        Puede que el enlace esté mal escrito o que la página ya no exista.
      </EstadoCarga>
    </section>
  );
}
