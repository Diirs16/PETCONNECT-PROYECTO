import { Component } from "react";
import { Link } from "react-router-dom";
import { RotateCw, TriangleAlert } from "lucide-react";
import { CORREO_ATENCION } from "../utils/contacto";

// Zona que atrapa errores (error boundary, hallazgo #8 del rediseño).
// Si una página falla al dibujarse, antes la pantalla quedaba en blanco; ahora se
// ve este mensaje y el encabezado y el pie siguen funcionando.
//
// Es una clase y no una función con hooks (lo normal en este proyecto) porque
// React solo deja atrapar errores con getDerivedStateFromError, que no existe
// como hook.
//
// Props:
//  - ruta: la dirección actual. Si cambia, la zona se reinicia sola, así el
//    usuario puede salir del error con cualquier enlace del menú.
//  - respaldo (opcional): qué mostrar en vez del mensaje de página completa.
export default class ZonaDeError extends Component {
  // rutaDelError: en qué dirección ocurrió el error, para saber cuándo se salió de ella.
  state = { conError: false, rutaDelError: null };

  static getDerivedStateFromError() {
    return { conError: true, rutaDelError: null };
  }

  // React llama a esto antes de cada dibujo (también justo después del error).
  static getDerivedStateFromProps(props, state) {
    if (!state.conError) return null;
    if (state.rutaDelError === null) return { rutaDelError: props.ruta };
    if (props.ruta !== state.rutaDelError) return { conError: false, rutaDelError: null };
    return null;
  }

  render() {
    if (!this.state.conError) return this.props.children;
    if (this.props.respaldo !== undefined) return this.props.respaldo;

    return (
      <section className="px-4 py-12 md:px-6 md:py-20">
        <title>No se pudo mostrar la página · PetConnect</title>
        <div
          role="alert"
          className="mx-auto max-w-xl rounded-tarjeta bg-superficie p-6 shadow-tarjeta md:p-8"
        >
          <TriangleAlert className="h-8 w-8 text-error" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl font-normal text-balance text-tinta">
            Esta página no se pudo mostrar
          </h1>
          <p className="mt-3 text-base text-pretty text-tinta-suave">
            Algo falló al cargarla. Vuelve al inicio o recarga la página. Si sigue
            pasando, escríbenos a{" "}
            <a
              href={`mailto:${CORREO_ATENCION}`}
              className="font-medium text-marca underline underline-offset-4 wrap-anywhere"
            >
              {CORREO_ATENCION}
            </a>
            .
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="presionable inline-flex min-h-11 items-center rounded-control bg-marca px-5 text-base font-semibold text-superficie no-underline hover:bg-marca-hover"
            >
              Volver al inicio
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="presionable inline-flex min-h-11 items-center gap-2 rounded-control border border-borde-fuerte px-5 text-base font-medium text-tinta hover:border-marca hover:text-marca"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Recargar la página
            </button>
          </div>
        </div>
      </section>
    );
  }
}
