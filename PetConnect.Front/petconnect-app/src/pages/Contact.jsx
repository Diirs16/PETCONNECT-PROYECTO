import { Mail, MapPin } from "lucide-react";
import FormularioSolicitud from "../components/FormularioSolicitud";
import { CIUDAD, CORREO_ATENCION } from "../utils/contacto";

// Fase 10 del rediseño. Antes:
//  - tenía su propia copia del correo y la ciudad escrita a mano; ahora salen de utils/contacto.js;
//  - mostraba un horario de atención que nadie confirmó (D10.1: se quitó, como el teléfono del pie en D3);
//  - el formulario traía su h3 sin un h2 antes (D10.3: h2 "Formulario de contacto" solo para lector de pantalla);
//  - todo centrado, en grises y con la tarjeta gris genérica.
// Orden (D10.3): primero el correo y la ciudad, que sirven sin cuenta; después el formulario,
// que pide iniciar sesión. Mismo orden visual y de lectura; dos columnas desde 1024 px.

const [usuarioCorreo, dominioCorreo] = CORREO_ATENCION.split("@");

/** Un dato de contacto: ícono en círculo turquesa claro, nombre del dato y su valor. */
function Dato({ icono: Icono, nombre, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marca-claro text-marca">
        <Icono className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-sm text-tinta-suave">{nombre}</dt>
        <dd className="text-base text-tinta">{children}</dd>
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <main className="page-enter mx-auto w-full max-w-5xl px-4 pb-12 pt-8 md:px-6 md:pb-20 md:pt-12">
      {/* React 19 sube <title> y <meta> al <head> mientras esta página está abierta (§3.6) */}
      <title>Contacto · PetConnect</title>
      <meta name="description" content="Escríbenos tus preguntas sobre adopción o productos." />

      <h1 className="font-display text-3xl font-normal tracking-tight text-balance text-tinta md:text-4xl">
        Contacto
      </h1>
      <p className="mt-2 max-w-[60ch] text-base text-pretty text-tinta-suave">
        ¿Tienes alguna pregunta o sugerencia? Escríbenos a nuestro correo de atención o con el
        formulario.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 md:mt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <section aria-labelledby="contacto-seccion-info" className="min-w-0">
          <h2 id="contacto-seccion-info" className="font-display text-xl font-normal text-tinta md:text-2xl">
            Información de contacto
          </h2>
          <dl className="mt-5 space-y-5">
            <Dato icono={Mail} nombre="Correo de atención">
              {/* <wbr> = "aquí se puede partir": en celulares angostos el correo baja de
                  línea antes de la @ y no en medio de una palabra (igual que en el pie) */}
              <a
                href={`mailto:${CORREO_ATENCION}`}
                className="inline-flex min-h-11 items-center rounded-control font-medium text-marca underline underline-offset-4 wrap-anywhere hover:text-marca-hover"
              >
                <span>
                  {usuarioCorreo}
                  <wbr />@{dominioCorreo}
                </span>
              </a>
            </Dato>
            <Dato icono={MapPin} nombre="Ubicación">
              {CIUDAD}
            </Dato>
          </dl>
        </section>

        {/* 3.6 (A-21): el mensaje se envía de verdad a la API, con la sesión iniciada
            (antes, en el 3.2, era una demo bloqueada). El h2 no se ve: el formulario ya
            trae su propio título visible ("Escríbenos", h3) y repetirlo sobraría. */}
        <section aria-labelledby="contacto-seccion-formulario" className="min-w-0">
          <h2 id="contacto-seccion-formulario" className="sr-only">
            Formulario de contacto
          </h2>
          <FormularioSolicitud tipo="contacto" />
        </section>
      </div>
    </main>
  );
}
