import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Info, Minus, Package, Plus, Trash2, X } from "lucide-react";
import { useCart } from "../context/useCart";
import EstadoCarga from "./EstadoCarga";
import FotoConRespaldo from "./FotoConRespaldo";
import { formatearPrecio } from "../utils/precio";
import { textoCambios, topeDeStock } from "../utils/carrito";

// Fase 5 del rediseño: el carrito es un <dialog> nativo abierto con showModal()
// (decisión D4, #1). El navegador ya hace lo difícil: atrapa el foco dentro,
// cierra con Escape, pone el fondo oscuro y avisa al lector de pantalla que se
// abrió una ventana. Aquí solo se agrega la animación de salida y que la página
// de atrás no se desplace (eso está en animations.css, clase "carrito-dialogo").
//
// A 375 px ocupa toda la pantalla; desde 640 px es un panel de 448 px a la derecha.

// Debe coincidir con la duración de salida de animations.css (240 ms; con
// "reducir movimiento" el fundido dura 150 ms y el resto ya es invisible).
const DURACION_SALIDA_MS = 240;

const unidades = (n) => (n === 1 ? "1 producto" : `${n} productos`);

/** Avisa qué se ajustó al cargar lo guardado (decisión 1 del plan). */
function AvisoCambios({ cambios }) {
  const frases = textoCambios(cambios);
  if (frases.length === 0) return null;
  return (
    <div className="mt-4 flex gap-3 rounded-control bg-aviso-claro p-4 text-aviso">
      <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-semibold">Actualizamos tu carrito</p>
        <ul className="mt-1 space-y-1 text-sm break-words">
          {frases.map((frase) => (
            <li key={frase}>{frase}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FilaProducto({ item, onCambiar, onQuitar, onIrAFicha }) {
  const maximo = Math.max(topeDeStock(item.stock), 1);
  const enMinimo = item.quantity <= 1;
  const enMaximo = item.quantity >= maximo;
  const subtotal = formatearPrecio(Number(item.price) * item.quantity);
  const precioUnidad = formatearPrecio(item.price);
  const idMaximo = `carrito-maximo-${item.id}`;

  // aria-disabled en vez de disabled: un botón desactivado pierde el foco y,
  // con teclado, la persona quedaría "perdida" al llegar al tope (#6, #10).
  const sumar = () => !enMaximo && onCambiar(item.id, item.quantity + 1);
  const restar = () => !enMinimo && onCambiar(item.id, item.quantity - 1);

  const botonCantidad =
    "presionable inline-flex h-11 w-11 items-center justify-center rounded-control text-tinta hover:bg-marca-claro hover:text-marca aria-disabled:cursor-not-allowed aria-disabled:text-borde-fuerte aria-disabled:hover:bg-transparent";

  return (
    <li className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-3 py-4">
      <FotoConRespaldo
        src={item.image}
        alt=""
        icono={Package}
        tono="marca"
        className="h-20 w-20 rounded-control"
      />

      <div className="min-w-0">
        {/* Nombre en 2 líneas; el title muestra el nombre completo (#30) */}
        <Link
          to={`/producto/${item.id}`}
          title={item.name}
          onClick={onIrAFicha}
          className="line-clamp-2 font-semibold leading-snug break-words text-tinta no-underline underline-offset-4 hover:underline"
        >
          {item.name}
        </Link>
        {subtotal ? (
          <p className="mt-1 font-semibold tabular-nums text-tinta">{subtotal}</p>
        ) : (
          <p className="mt-1 text-sm text-tinta-suave">Precio no disponible</p>
        )}
        {subtotal && item.quantity > 1 && (
          <p className="text-sm tabular-nums text-tinta-suave">{precioUnidad} c/u</p>
        )}
      </div>

      <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 sm:col-span-1 sm:col-start-2">
        <div
          role="group"
          aria-label={`Cantidad de ${item.name}`}
          className="inline-flex items-center rounded-control border border-borde-fuerte"
        >
          <button
            type="button"
            onClick={restar}
            aria-disabled={enMinimo || undefined}
            aria-label="Quitar una unidad"
            className={botonCantidad}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            aria-live="polite"
            aria-atomic="true"
            className="min-w-10 text-center font-semibold tabular-nums text-tinta"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={sumar}
            aria-disabled={enMaximo || undefined}
            aria-describedby={enMaximo ? idMaximo : undefined}
            aria-label="Agregar una unidad"
            className={botonCantidad}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onQuitar(item.id)}
          className="presionable inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-tinta-suave hover:bg-papel hover:text-error"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Quitar
          <span className="sr-only"> {item.name} del carrito</span>
        </button>

        {enMaximo && (
          <p id={idMaximo} className="w-full text-sm text-tinta-suave">
            Máximo disponible: {maximo}
          </p>
        )}
      </div>
    </li>
  );
}

export default function CartModal() {
  const {
    items,
    estadoCarrito,
    cambiosCarrito,
    descartarCambios,
    reintentarCarrito,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    totalPrice,
  } = useCart();
  const dialogoRef = useRef(null);
  const tituloRef = useRef(null);
  const anteriorRef = useRef(null); // quién tenía el foco al abrir (el ícono del carrito)
  const [cerrando, setCerrando] = useState(false);

  // Termina de cerrar: el <dialog> se oculta y el foco vuelve a donde estaba.
  const terminarCierre = useCallback(() => {
    const dialogo = dialogoRef.current;
    if (dialogo?.open) dialogo.close();
    setCerrando(false);
    setIsOpen(false);
    descartarCambios();
    // Los navegadores actuales ya devuelven el foco; esto cubre a los que no.
    const anterior = anteriorRef.current;
    if (anterior?.isConnected && (!document.activeElement || document.activeElement === document.body)) {
      anterior.focus();
    }
  }, [setIsOpen, descartarCambios]);

  // Abrir con showModal() cuando el Header pone isOpen en true
  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (isOpen && !dialogo.open) {
      anteriorRef.current = document.activeElement;
      dialogo.showModal();
    }
  }, [isOpen]);

  // Salida animada: primero la clase "cerrando" (el panel se va por la derecha)
  // y, cuando termina, se cierra de verdad.
  useEffect(() => {
    if (!cerrando) return undefined;
    const reloj = setTimeout(terminarCierre, DURACION_SALIDA_MS);
    return () => clearTimeout(reloj);
  }, [cerrando, terminarCierre]);

  const cerrar = () => {
    if (dialogoRef.current?.open) setCerrando(true);
  };

  // Escape: el navegador dispara "cancel". Se frena para animar la salida.
  const alCancelar = (evento) => {
    evento.preventDefault();
    cerrar();
  };

  // Clic en el fondo oscuro: el clic llega al propio <dialog>, no a su contenido.
  const alHacerClic = (evento) => {
    if (evento.target === evento.currentTarget) cerrar();
  };

  // Al quitar un producto su botón desaparece: el foco pasa al título para que
  // quien usa teclado o lector de pantalla no quede fuera de la ventana.
  const quitar = (id) => {
    removeItem(id);
    tituloRef.current?.focus();
  };

  const unidadesCargadas = items.reduce((suma, i) => suma + i.quantity, 0);
  const vacio = items.length === 0 && estadoCarrito === "listo";

  return (
    <dialog
      ref={dialogoRef}
      aria-labelledby="titulo-carrito"
      onCancel={alCancelar}
      onClose={terminarCierre}
      onClick={alHacerClic}
      className={`carrito-dialogo fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-none border-0 bg-superficie p-0 text-tinta shadow-elevada sm:max-w-md ${cerrando ? "cerrando" : ""}`}
    >
      {/* Solo se dibuja el contenido mientras está abierto */}
      {isOpen && (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-borde px-4 py-3 sm:px-6">
            <div className="min-w-0 py-1.5">
              <h2
                id="titulo-carrito"
                ref={tituloRef}
                tabIndex={-1}
                // Recibe el foco al abrir y al quitar un producto (para el lector de
                // pantalla), pero no es un control: sin contorno de foco.
                className="font-display text-xl font-normal leading-tight text-tinta outline-none sm:text-2xl"
              >
                Carrito de compras
              </h2>
              {unidadesCargadas > 0 && (
                <p className="mt-0.5 text-sm tabular-nums text-tinta-suave">{unidades(unidadesCargadas)}</p>
              )}
            </div>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar carrito"
              className="presionable inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-tinta hover:bg-marca-claro hover:text-marca"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 [scrollbar-color:var(--color-borde-fuerte)_transparent] sm:px-6">
            <AvisoCambios cambios={cambiosCarrito} />

            {estadoCarrito === "cargando" && (
              <div className="mt-6">
                <EstadoCarga tipo="cargando" titulo="Actualizando tu carrito…" />
              </div>
            )}
            {estadoCarrito === "error" && (
              <div className="mt-6">
                <EstadoCarga
                  tipo="error"
                  titulo="No pudimos actualizar tu carrito"
                  onReintentar={reintentarCarrito}
                >
                  Tus productos siguen guardados. Revisa tu conexión y vuelve a intentarlo.
                </EstadoCarga>
              </div>
            )}

            {vacio && (
              <div className="mt-6">
                <EstadoCarga
                  tipo="vacio"
                  titulo="Tu carrito está vacío"
                  accion={
                    <Link
                      to="/catalogo"
                      onClick={cerrar}
                      className="presionable inline-flex min-h-11 items-center gap-2 rounded-control bg-marca px-5 text-base font-semibold text-superficie no-underline hover:bg-marca-hover"
                    >
                      Ver catálogo
                    </Link>
                  }
                >
                  Agrega productos desde el catálogo.
                </EstadoCarga>
              </div>
            )}

            {items.length > 0 && (
              <ul className="divide-y divide-borde">
                {items.map((item) => (
                  <FilaProducto
                    key={item.id}
                    item={item}
                    onCambiar={updateQuantity}
                    onQuitar={quitar}
                    onIrAFicha={cerrar}
                  />
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-borde px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <span className="text-base text-tinta-suave">Total</span>
                <span className="text-2xl font-semibold tabular-nums text-tinta">
                  {formatearPrecio(totalPrice)}
                </span>
              </div>
              {/* Es un enlace (lleva a otra página), con forma de botón principal */}
              <Link
                to="/checkout"
                onClick={cerrar}
                className="presionable flex min-h-12 w-full items-center justify-center rounded-control bg-marca px-6 text-base font-semibold text-superficie no-underline hover:bg-marca-hover"
              >
                Ir a pagar
              </Link>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
