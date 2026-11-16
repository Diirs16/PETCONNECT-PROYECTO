import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCart } from "../context/useCart";
import AvisoDemo from "../components/AvisoDemo";
import EstadoCarga from "../components/EstadoCarga";
import { formatearPrecio } from "../utils/precio";

// Fase 6 del rediseño: Finalizar compra.
// Sigue siendo una demo honesta (ítem 3.2, A-21): la API no tiene pedidos ni
// pagos, así que no se crea nada, no se cobra nada, los campos van bloqueados
// con <fieldset disabled> y el carrito NO se vacía.
//
// Decisiones aprobadas:
// - D6.1: mientras el carrito trae nombre y precio de la API se ve "cargando";
//   si la API no responde, "error" con Reintentar. "Vacío" solo cuando la carga
//   terminó bien y de verdad no hay productos (antes decía "vacío" al recargar).
//   Con error NO se muestra un resumen a medias: el total sería falso.
// - D6.2: "Volver al catálogo" es un enlace (#37). Antes era navigate(-1), que
//   sacaba del sitio si se entraba directo a /checkout.
// - D6.3: el resumen va primero (en celular arriba, en escritorio a la izquierda):
//   lo que se ve sigue el mismo orden en que lo lee un lector de pantalla.
// - D6.4: se mantienen los 4 campos, bloqueados: no se recoge ningún dato (Ley 1581).

const NUMERO = new Intl.NumberFormat("es-CO");

/** 1 → "1 unidad"; 128 → "128 unidades" (antes "x128" pegado al nombre, #25). */
function textoUnidades(cantidad) {
  return cantidad === 1 ? "1 unidad" : `${NUMERO.format(cantidad)} unidades`;
}

// Campos bloqueados: 16 px para que el iPhone no haga zoom (#14) y borde de
// los tokens con contraste 3,56:1 (#15), aunque estén desactivados.
const CAMPO_DEMO =
  "block min-h-11 w-full rounded-control border border-borde-fuerte bg-papel px-3 text-base text-tinta disabled:cursor-not-allowed";

const ETIQUETA = "mb-1 block text-sm font-medium text-tinta";

const CAMPOS = [
  { id: "checkout-name", name: "name", etiqueta: "Nombre completo" },
  { id: "checkout-address", name: "address", etiqueta: "Dirección" },
  { id: "checkout-city", name: "city", etiqueta: "Ciudad" },
  { id: "checkout-phone", name: "phone", etiqueta: "Teléfono", type: "tel" },
];

// Vacío: "Ver catálogo" es la única salida, va como botón principal.
const VER_CATALOGO = (
  <Link
    to="/catalogo"
    className="presionable inline-flex min-h-11 items-center gap-2 rounded-control bg-marca px-5 text-base font-semibold text-superficie no-underline hover:bg-marca-hover"
  >
    Ver catálogo
  </Link>
);

// Error: lo principal es "Reintentar"; el catálogo queda en segundo plano (con borde).
const VER_CATALOGO_SECUNDARIO = (
  <Link
    to="/catalogo"
    className="presionable inline-flex min-h-11 items-center gap-2 rounded-control border border-borde-fuerte bg-superficie px-5 text-base font-semibold text-tinta no-underline hover:border-marca hover:text-marca"
  >
    Ver catálogo
  </Link>
);

/** Una fila del resumen. Aguanta un nombre de 120 caracteres sin sacar el precio de la caja (#25). */
function FilaResumen({ item }) {
  const precioUnidad = formatearPrecio(item.price);
  // Sin precio no hay subtotal: Number(null) es 0 y saldría "$ 0" (peor dato de la Fase 6).
  const subtotal = precioUnidad ? formatearPrecio(Number(item.price) * item.quantity) : null;

  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        {/* Nombre en 2 líneas como mucho; el title muestra el nombre completo */}
        <p title={item.name} className="line-clamp-2 font-semibold leading-snug break-words text-tinta">
          {item.name}
        </p>
        <p className="mt-0.5 text-sm tabular-nums text-tinta-suave">
          {textoUnidades(item.quantity)}
          {precioUnidad && item.quantity > 1 && ` de ${precioUnidad}`}
        </p>
        {!subtotal && <p className="mt-0.5 text-sm text-tinta-suave">Precio no disponible</p>}
      </div>
      {subtotal && <p className="shrink-0 font-semibold tabular-nums text-tinta">{subtotal}</p>}
    </li>
  );
}

function Resumen({ items, totalPrice }) {
  // totalPrice no suma los productos sin precio: se avisa para que el total no engañe.
  const sinPrecio = items.filter((i) => formatearPrecio(i.price) === null).length;
  const total = sinPrecio < items.length ? formatearPrecio(totalPrice) : null;

  return (
    <section aria-labelledby="titulo-resumen" className="min-w-0">
      <h2 id="titulo-resumen" className="font-display text-xl font-normal text-tinta md:text-2xl">
        Resumen del pedido
      </h2>
      <div className="mt-4 rounded-tarjeta border border-borde bg-superficie p-4 shadow-tarjeta sm:p-5">
        <ul className="divide-y divide-borde">
          {items.map((item) => (
            <FilaResumen key={item.id} item={item} />
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-borde pt-4">
          <span className="text-base text-tinta-suave">Total</span>
          {total ? (
            <span className="text-2xl font-semibold tabular-nums text-tinta">{total}</span>
          ) : (
            <span className="text-base text-tinta-suave">Precio no disponible</span>
          )}
        </div>
        {total && sinPrecio > 0 && (
          <p className="mt-1 text-right text-sm text-tinta-suave">
            {sinPrecio === 1 ? "No incluye 1 producto sin precio." : `No incluye ${sinPrecio} productos sin precio.`}
          </p>
        )}
      </div>
    </section>
  );
}

function DatosEnvio() {
  return (
    <section aria-labelledby="titulo-envio" className="min-w-0">
      <h2 id="titulo-envio" className="font-display text-xl font-normal text-tinta md:text-2xl">
        Datos de envío
      </h2>
      <form onSubmit={(e) => e.preventDefault()} aria-labelledby="titulo-envio" className="mt-4 space-y-5">
        <AvisoDemo id="checkout-demo" titulo="Demo — no se procesan pedidos">
          Esta tienda es una muestra: no se crean pedidos, no se cobra nada y
          este formulario no se puede llenar. Tu carrito se conserva.
        </AvisoDemo>

        <fieldset disabled aria-describedby="checkout-demo" className="min-w-0 space-y-4">
          {CAMPOS.map((campo) => (
            <div key={campo.id}>
              <label htmlFor={campo.id} className={ETIQUETA}>
                {campo.etiqueta}
              </label>
              <input id={campo.id} name={campo.name} type={campo.type ?? "text"} className={CAMPO_DEMO} />
            </div>
          ))}
        </fieldset>

        <button
          type="submit"
          disabled
          className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-control border border-borde-fuerte bg-papel px-6 text-base font-semibold text-tinta-suave"
        >
          Pedido no disponible (demo)
        </button>
      </form>
    </section>
  );
}

export default function Checkout() {
  const { items, totalPrice, estadoCarrito, reintentarCarrito } = useCart();
  const tituloRef = useRef(null);

  // Al pulsar "Reintentar" el botón desaparece y el foco caería al inicio de la
  // página. Se pasa al título para que quien usa teclado siga en el mismo lugar.
  const reintentar = () => {
    reintentarCarrito();
    tituloRef.current?.focus();
  };

  let contenido;
  if (estadoCarrito === "cargando") {
    contenido = <EstadoCarga tipo="cargando" titulo="Cargando tu pedido…" />;
  } else if (estadoCarrito === "error") {
    contenido = (
      <EstadoCarga
        tipo="error"
        titulo="No pudimos cargar tu carrito"
        onReintentar={reintentar}
        accion={VER_CATALOGO_SECUNDARIO}
      >
        Tus productos siguen guardados. Revisa tu conexión y vuelve a intentarlo.
      </EstadoCarga>
    );
  } else if (items.length === 0) {
    contenido = (
      <EstadoCarga tipo="vacio" titulo="Tu carrito está vacío" accion={VER_CATALOGO}>
        Agrega productos desde el catálogo para finalizar la compra.
      </EstadoCarga>
    );
  } else {
    contenido = (
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Resumen items={items} totalPrice={totalPrice} />
        <DatosEnvio />
      </div>
    );
  }

  return (
    <main className="page-enter mx-auto w-full max-w-5xl px-4 pb-16 pt-4 md:px-6 md:pt-6">
      {/* React 19 sube <title> y <meta> al <head> mientras esta página está abierta (§3.6).
          noindex: una página de compra de demo no debe salir en los buscadores. */}
      <title>Finalizar compra (demo) · PetConnect</title>
      <meta name="robots" content="noindex" />

      <Link
        to="/catalogo"
        className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-base text-tinta-suave no-underline hover:text-marca"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al catálogo
      </Link>

      {/* tabIndex -1: recibe el foco tras "Reintentar", pero no es un control (sin contorno) */}
      <h1
        ref={tituloRef}
        tabIndex={-1}
        className="mt-3 font-display text-2xl font-normal leading-tight text-tinta outline-none md:mt-4 md:text-3xl lg:text-4xl"
      >
        Finalizar compra
      </h1>

      <div className="mt-6 md:mt-8">{contenido}</div>
    </main>
  );
}
