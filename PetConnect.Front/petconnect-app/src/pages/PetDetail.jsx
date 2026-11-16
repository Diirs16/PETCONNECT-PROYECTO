import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { getMascota } from "../services/api";
import { formatearEdad, formatearSexo } from "../utils/mascota";
import { resumir } from "../utils/texto";
import FormularioSolicitud from "../components/FormularioSolicitud";
import EstadoCarga from "../components/EstadoCarga";
import FotoConRespaldo from "../components/FotoConRespaldo";
import { iconoEspecie } from "../components/iconoEspecie";

// Fase 8 del rediseño: ficha de la mascota como "expediente" (§4.2).
//   - La foto y el nombre son lo que se recuerda: foto grande (cuadrada en el
//     celular, vertical 4:5 desde md) y nombre con la letra de títulos.
//   - La especie va en la etiqueta terracota, como en la tarjeta de adopción.
//   - Raza, edad y sexo van en un recuadro, una fila por dato (D8.1). Antes era
//     una línea "Raza · Edad · Sexo" en gris claro.
//   - En el celular el botón "Solicitar adopción" va antes de la descripción
//     (no hay que bajar para pedirla) (D8.3).
// Solo se muestra lo que manda la API: nada de vacunas, tamaño ni esterilización
// (la BD no los tiene y un dato de salud no se inventa, ítem 3.4).

/** Texto limpio o "" si no es texto (la API podría mandar null). */
function textoLimpio(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

const VOLVER_ADOPCION = (
  <Link
    to="/adopcion"
    className="presionable inline-flex min-h-11 items-center gap-2 rounded-control border border-borde-fuerte bg-superficie px-5 text-base font-semibold text-tinta no-underline hover:border-marca hover:text-marca"
  >
    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    Volver a adopción
  </Link>
);

export default function PetDetail() {
  const { id } = useParams();
  // 3.3 (A-23): "no-encontrada" solo si la API respondió 404 (no existe o no
  // está en adopción, ítem 2.9). Cualquier otro fallo (503 BD caída, 502 API
  // apagada, 0 sin conexión) es "error".
  // Fase 8 (igual que ProductDetail en la Fase 4): la respuesta se guarda junto
  // con la "pedida" (id + intento) que la trajo. Si la URL cambia a otra
  // mascota, la respuesta guardada ya no es de esa pedida y se ve "cargando"
  // (antes seguía mostrando la mascota o el error anterior mientras tanto).
  const [intento, setIntento] = useState(0); // al sumar 1, se vuelve a pedir la ficha
  const pedida = `${id}#${intento}`;
  const [respuesta, setRespuesta] = useState({ pedida: null, estado: "cargando", pet: null });
  const estado = respuesta.pedida === pedida ? respuesta.estado : "cargando"; // "cargando" | "no-encontrada" | "error" | "listo"
  const pet = respuesta.pet;

  // D8.4: el formulario se abre dentro de la ficha. Se guarda PARA QUÉ
  // respuesta se abrió: si llega otra ficha (otro id, o la misma vuelta a
  // pedir), ya no coincide y el formulario se cierra solo, sin un useEffect.
  const [formAbiertoPara, setFormAbiertoPara] = useState(null);
  const formAbierto = estado === "listo" && formAbiertoPara === respuesta;

  // Foco (teclado y lector de pantalla). El <main> es el mismo en todos los
  // estados: tras "Reintentar" el foco espera en él (no cae al <body>) y,
  // cuando la ficha carga, pasa al nombre.
  const mainRef = useRef(null);
  const nombreRef = useRef(null);
  const botonRef = useRef(null);
  const enfocarNombre = useRef(false);
  const devolverFoco = useRef(false);

  useEffect(() => {
    let vigente = true; // evita actualizar la página si el usuario ya se fue
    getMascota(id)
      .then((data) => {
        if (vigente) setRespuesta({ pedida, estado: "listo", pet: data });
      })
      .catch((e) => {
        if (vigente) setRespuesta({ pedida, estado: e.status === 404 ? "no-encontrada" : "error", pet: null });
      });
    return () => {
      vigente = false;
    };
  }, [id, pedida]);

  useEffect(() => {
    if (estado === "listo" && enfocarNombre.current) {
      enfocarNombre.current = false;
      nombreRef.current?.focus();
    }
  }, [estado]);

  // Al pulsar "Cerrar" el botón "Solicitar adopción" vuelve a existir: el foco va a él.
  useEffect(() => {
    if (!formAbierto && devolverFoco.current) {
      devolverFoco.current = false;
      botonRef.current?.focus();
    }
  }, [formAbierto]);

  function reintentar() {
    setIntento((n) => n + 1); // cambia la pedida: se ve "cargando" y se vuelve a pedir
    enfocarNombre.current = true;
    mainRef.current?.focus(); // el botón "Reintentar" va a desaparecer
  }

  function cerrarFormulario() {
    devolverFoco.current = true;
    setFormAbiertoPara(null);
  }

  return (
    <main
      ref={mainRef}
      // tabIndex -1: recibe el foco tras "Reintentar", pero no es un control (sin contorno)
      tabIndex={-1}
      className={`mx-auto w-full max-w-7xl px-4 outline-none md:px-6 ${estado === "listo" ? "page-enter pb-16 pt-4 md:pt-6" : "py-16"}`}
    >
      {estado === "cargando" && (
        <>
          <title>Cargando mascota · PetConnect</title>
          <EstadoCarga tipo="cargando" encabezado="h1" titulo="Cargando información de la mascota…" />
        </>
      )}
      {estado === "no-encontrada" && (
        <>
          <title>Mascota no encontrada · PetConnect</title>
          {/* Que los buscadores no guarden una ficha que no existe */}
          <meta name="robots" content="noindex" />
          <EstadoCarga tipo="vacio" encabezado="h1" titulo="Mascota no encontrada" accion={VOLVER_ADOPCION}>
            Puede que ya haya sido adoptada o que ya no esté disponible.
          </EstadoCarga>
        </>
      )}
      {estado === "error" && (
        <>
          <title>No pudimos cargar la mascota · PetConnect</title>
          <EstadoCarga
            tipo="error"
            encabezado="h1"
            titulo="No pudimos cargar la información de esta mascota"
            onReintentar={reintentar}
            accion={VOLVER_ADOPCION}
          >
            Revisa tu conexión o inténtalo de nuevo en unos minutos.
          </EstadoCarga>
        </>
      )}
      {estado === "listo" && (
        <Ficha
          pet={pet}
          nombreRef={nombreRef}
          botonRef={botonRef}
          formAbierto={formAbierto}
          onAbrir={() => setFormAbiertoPara(respuesta)}
          onCerrar={cerrarFormulario}
        />
      )}
    </main>
  );
}

/** La ficha ya cargada: foto, nombre, especie, expediente, botón y descripción. */
function Ficha({ pet, nombreRef, botonRef, formAbierto, onAbrir, onCerrar }) {
  const nombre = textoLimpio(pet.name);
  // La especie se muestra tal como la escribió el refugio ("perra", "GATA").
  const especie = textoLimpio(pet.species);
  const raza = textoLimpio(pet.breed);
  const edad = formatearEdad(pet.age);
  const sexo = formatearSexo(pet.gender);
  const descripcion = textoLimpio(pet.description);

  // §3.6 (D8.8 y D8.9): pestaña y descripción para buscadores y para compartir.
  const tituloPestana = especie
    ? `${nombre}, ${especie.toLocaleLowerCase("es")} en adopción · PetConnect`
    : `${nombre} en adopción · PetConnect`;
  const descripcionMeta = resumir(descripcion, 150) || `Datos de ${nombre} y solicitud de adopción.`;

  return (
    <>
      {/* React 19 sube <title> y <meta> al <head> mientras la ficha está abierta */}
      <title>{tituloPestana}</title>
      <meta name="description" content={descripcionMeta} />

      <Link
        to="/adopcion"
        className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-base text-tinta-suave no-underline hover:text-marca"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a adopción
      </Link>

      <div className="mt-3 grid gap-6 md:mt-6 md:grid-cols-2 md:gap-10 lg:gap-14">
        {/* En escritorio la foto se queda a la vista mientras se lee una
            descripción larga (top-24 = debajo del encabezado fijo). */}
        <FotoConRespaldo
          src={pet.image}
          alt={nombre}
          icono={iconoEspecie(especie)}
          tono="acento"
          loading="eager"
          className="aspect-square w-full rounded-tarjeta border border-borde md:sticky md:top-24 md:aspect-[4/5] md:self-start"
        />

        <div className="min-w-0">
          {/* flex-wrap: con un nombre muy largo la especie baja de renglón en
              vez de aplastarse (#26, #5 de §3.3). */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1
              ref={nombreRef}
              tabIndex={-1}
              className="min-w-0 font-display text-3xl font-normal leading-tight text-balance break-words text-tinta outline-none md:text-4xl lg:text-5xl"
            >
              {nombre}
            </h1>
            {especie && (
              <span className="max-w-full break-words rounded-control bg-acento-claro px-3 py-1 text-base font-semibold text-acento-oscuro">
                {especie}
              </span>
            )}
          </div>

          {/* Expediente: solo los datos que se conocen. Sin ninguno, no hay
              recuadro (nunca "Desconocido"). */}
          {(raza || edad || sexo) && (
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-tarjeta border border-borde bg-superficie p-4 text-base md:p-5">
              {raza && (
                <>
                  <dt className="text-tinta-suave">Raza</dt>
                  <dd className="min-w-0 break-words text-tinta">{raza}</dd>
                </>
              )}
              {edad && (
                <>
                  <dt className="text-tinta-suave">Edad</dt>
                  <dd className="min-w-0 break-words text-tinta">{edad}</dd>
                </>
              )}
              {sexo && (
                <>
                  <dt className="text-tinta-suave">Sexo</dt>
                  <dd className="min-w-0 break-words text-tinta">{sexo}</dd>
                </>
              )}
            </dl>
          )}

          <div className="mt-6">
            {formAbierto ? (
              // 3.6 (A-21): la solicitud se envía de verdad a la API.
              <FormularioSolicitud tipo="adopcion" mascota={pet} onCerrar={onCerrar} enfocarAlAbrir />
            ) : (
              <button
                ref={botonRef}
                type="button"
                onClick={onAbrir}
                className="presionable inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-acento px-6 text-base font-semibold text-superficie hover:bg-acento-oscuro sm:w-auto"
              >
                <Heart className="h-5 w-5 shrink-0" aria-hidden="true" />
                Solicitar adopción
              </button>
            )}
          </div>

          {/* whitespace-pre-line respeta los saltos de línea que escribió el
              refugio. Si viene vacía, no se dibuja la sección. El texto viene
              de la BD y no se reescribe. */}
          {descripcion && (
            <section aria-labelledby="titulo-descripcion" className="mt-8 border-t border-borde pt-6">
              <h2 id="titulo-descripcion" className="text-lg font-semibold text-tinta">
                Descripción
              </h2>
              <p className="mt-3 max-w-prose whitespace-pre-line break-words text-base leading-relaxed text-tinta">
                {descripcion}
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
