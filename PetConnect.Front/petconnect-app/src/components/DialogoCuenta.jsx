import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// Fase 9 del rediseño (D9.1): la ventana de "Iniciar sesión" y la de "Crear cuenta"
// son un <dialog> nativo abierto con showModal() (decisión D4, #1), igual que el
// carrito. El navegador atrapa el foco dentro, cierra con Escape, oscurece el fondo y
// avisa al lector de pantalla que se abrió una ventana. Este componente agrega:
// - la salida animada de 150 ms (§3.4 #4; la entrada y el fondo están en animations.css);
// - cerrar con un clic en el fondo, solo si el clic empezó y terminó fuera del recuadro
//   (así no se cierra al arrastrar el mouse mientras se selecciona texto);
// - a dónde vuelve el foco al cerrar (D9.3).
//
// Props:
// - abierto: si la ventana debe estar abierta (showLogin / showRegister).
// - paso: cambia al pasar de un paso a otro; el foco va al elemento con data-autofoco.
// - titulo, idTitulo: el título del paso (aria-labelledby).
// - enfocarTitulo: el foco va al título en vez de a un campo (paso de autorización).
// - etiquetaCerrar: nombre del botón X para el lector de pantalla.
// - cambiando: true si se cierra para abrir la otra ventana de cuenta (sin animación
//   y sin mover el foco: lo recibe la otra ventana).
// - alCerrar: limpia lo del paso. Se llama SIEMPRE que la ventana se cierra (X, Escape,
//   fondo, al entrar con éxito o al cambiar de ventana).

// Debe coincidir con la salida de .cuenta-dialogo.cerrando en animations.css
const DURACION_SALIDA_MS = 150;

// Quién abrió la ventana (el botón del Header, "Inicia sesión para enviar"…). Es uno
// solo para las dos ventanas: al pasar de Iniciar sesión a Crear cuenta se conserva.
let origen = null;

// Último botón pulsado que abre una ventana de cuenta (los que tienen
// data-foco-respaldo). Hace falta porque algunos desaparecen en el mismo clic
// ("Volver a iniciar sesión", el menú del celular): al abrir, el foco ya está en
// el <body> y no se sabría de dónde se vino.
let ultimoPulsado = null;
if (typeof document !== "undefined") {
  document.addEventListener(
    "click",
    (evento) => {
      ultimoPulsado = evento.target instanceof Element ? evento.target.closest("[data-foco-respaldo]") : null;
    },
    true,
  );
}

const esVisible = (el) => Boolean(el?.isConnected) && el.getClientRects().length > 0;

// Si quien abrió ya no se ve (el menú del celular se cerró, el botón cambió por
// "Cerrar sesión" o por el formulario), se usa el respaldo que ese botón indicó en
// data-foco-respaldo: una lista de id, se usa el primero que esté visible.
function destinoDelFoco(el) {
  if (!el) return null;
  if (esVisible(el)) return el;
  const ids = (el.dataset?.focoRespaldo ?? "").split(/\s+/).filter(Boolean);
  return ids.map((id) => document.getElementById(id)).find(esVisible) ?? null;
}

// El clic en el fondo oscuro llega al propio <dialog>. Se mira si cayó fuera del
// recuadro (la barra de desplazamiento del diálogo también es el <dialog>).
function fueraDelRecuadro(dialogo, evento) {
  const r = dialogo.getBoundingClientRect();
  return evento.clientX < r.left || evento.clientX > r.right || evento.clientY < r.top || evento.clientY > r.bottom;
}

export default function DialogoCuenta({
  abierto,
  paso,
  titulo,
  idTitulo,
  enfocarTitulo = false,
  etiquetaCerrar,
  cambiando = false,
  alCerrar,
  children,
}) {
  const dialogoRef = useRef(null);
  const empezoFuera = useRef(false);
  const [cerrando, setCerrando] = useState(false);

  // Abrir con showModal() y cerrar al instante cuando lo decide otro (al entrar con
  // éxito o al cambiar a la otra ventana): en esos casos el contenido ya cambió y
  // una salida animada mostraría el paso equivocado.
  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) {
      // Nunca dos ventanas de cuenta a la vez: al pasar de Crear cuenta a Iniciar
      // sesión, React abre esta antes de que la otra se cierre sola; se cierra aquí.
      document.querySelectorAll("dialog.cuenta-dialogo[open]").forEach((otro) => {
        if (otro !== dialogo) otro.close();
      });
      const activo = document.activeElement;
      // Al llegar desde la otra ventana el foco está en el <body>: se conserva el origen
      if (activo && activo !== document.body && !activo.closest("dialog")) origen = activo;
      else if (!origen) origen = ultimoPulsado;
      dialogo.showModal();
    } else if (!abierto && dialogo.open) {
      dialogo.close();
    }
  }, [abierto]);

  // Al abrir y en cada paso nuevo, el foco va al campo (o título) marcado
  useEffect(() => {
    if (abierto) dialogoRef.current?.querySelector("[data-autofoco]")?.focus();
  }, [abierto, paso]);

  // Salida animada: primero la clase "cerrando" y, al terminar, se cierra de verdad
  useEffect(() => {
    if (!cerrando) return undefined;
    const reloj = setTimeout(() => {
      if (dialogoRef.current?.open) dialogoRef.current.close();
    }, DURACION_SALIDA_MS);
    return () => clearTimeout(reloj);
  }, [cerrando]);

  const cerrar = () => {
    if (dialogoRef.current?.open) setCerrando(true);
  };

  // Escape: el navegador dispara "cancel"; se frena para animar la salida. Si se
  // pulsa Escape dos veces seguidas, Chrome cierra sin esperar: por eso la limpieza
  // está en "close", que llega siempre.
  const alCancelar = (evento) => {
    evento.preventDefault();
    cerrar();
  };

  const alTerminarDeCerrar = () => {
    setCerrando(false);
    alCerrar();
    if (cambiando) return;
    const destino = destinoDelFoco(origen);
    origen = null;
    ultimoPulsado = null;
    if (destino && document.activeElement !== destino) destino.focus();
  };

  return (
    <dialog
      ref={dialogoRef}
      aria-labelledby={idTitulo}
      onCancel={alCancelar}
      onClose={alTerminarDeCerrar}
      onPointerDown={(e) => {
        empezoFuera.current = e.target === e.currentTarget && fueraDelRecuadro(e.currentTarget, e);
      }}
      onClick={(e) => {
        if (empezoFuera.current && e.target === e.currentTarget && fueraDelRecuadro(e.currentTarget, e)) cerrar();
        empezoFuera.current = false;
      }}
      // A 375 px ocupa el ancho menos 16 px por lado; si es más alto que la pantalla
      // (registro, autorización) se desplaza por dentro y la página de atrás no.
      className={`cuenta-dialogo m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-tarjeta border-0 bg-superficie p-0 text-tinta shadow-elevada [scrollbar-color:var(--color-borde-fuerte)_transparent] ${cerrando ? "cerrando" : ""}`}
    >
      {abierto && (
        <>
          {/* El título y la X quedan arriba al desplazar: cerrar siempre está a mano */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-superficie px-5 pt-5 pb-3 sm:px-6">
            <h2
              id={idTitulo}
              tabIndex={enfocarTitulo ? -1 : undefined}
              data-autofoco={enfocarTitulo || undefined}
              className="min-w-0 pt-1.5 font-display text-2xl leading-tight font-normal text-balance break-words text-tinta outline-none"
            >
              {titulo}
            </h2>
            <button
              type="button"
              onClick={cerrar}
              aria-label={etiquetaCerrar}
              className="presionable -mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-tinta hover:bg-marca-claro hover:text-marca"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="px-5 pb-6 sm:px-6">{children}</div>
        </>
      )}
    </dialog>
  );
}
