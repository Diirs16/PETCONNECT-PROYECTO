import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CircleCheck, Package, PackageX, ShoppingCart } from "lucide-react";
import { getProducto } from "../services/api";
import EstadoCarga from "../components/EstadoCarga";
import FotoConRespaldo from "../components/FotoConRespaldo";
import { useCart } from "../context/useCart";
import { formatearPrecio } from "../utils/precio";
import { resumir } from "../utils/texto";

// Fase 4 del rediseño: ficha de producto sobria (la emotiva será la de mascota,
// Fase 8). Solo muestra lo que manda la API: foto, nombre, precio, categoría,
// stock y descripción. Antes tenía "Nuevo", "-20 %" y precio anterior, que la
// BD no tiene (#41), y una palomita verde también cuando decía "Agotado" (#31).

const NUMERO = new Intl.NumberFormat("es-CO");

/** 1 → "1 unidad disponible"; 1500 → "1.500 unidades disponibles". */
function textoDisponible(stock) {
  const n = Number(stock);
  return n === 1 ? "1 unidad disponible" : `${NUMERO.format(n)} unidades disponibles`;
}

/** Texto limpio o "" si no es texto (la API podría mandar null). */
function textoLimpio(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

const VOLVER_CATALOGO = (
  <Link
    to="/catalogo"
    className="presionable inline-flex min-h-11 items-center gap-2 rounded-control border border-borde-fuerte bg-superficie px-5 text-base font-semibold text-tinta no-underline hover:border-marca hover:text-marca"
  >
    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    Volver al catálogo
  </Link>
);

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  // 3.3 (A-23): "no-encontrado" solo si la API respondió 404; cualquier otro
  // fallo es "error". Antes, si la API fallaba, se mostraba un producto
  // inventado de data/products.js que hasta se podía agregar al carrito.
  // Fase 4: la respuesta se guarda junto con la "pedida" (id + intento) que la
  // trajo. Si la URL cambia a otro producto, la respuesta guardada ya no es de
  // esa pedida y la página dice "cargando" (antes seguía mostrando el producto
  // o el error anterior mientras llegaba el nuevo).
  const [intento, setIntento] = useState(0); // al sumar 1, se vuelve a pedir la ficha
  const pedida = `${id}#${intento}`;
  const [respuesta, setRespuesta] = useState({ pedida: null, estado: "cargando", product: null });
  const estado = respuesta.pedida === pedida ? respuesta.estado : "cargando"; // "cargando" | "no-encontrado" | "error" | "listo"
  const product = respuesta.product;

  useEffect(() => {
    let vigente = true; // evita actualizar la página si el usuario ya se fue
    getProducto(id)
      .then((data) => {
        if (vigente) setRespuesta({ pedida, estado: "listo", product: data });
      })
      .catch((e) => {
        if (vigente) setRespuesta({ pedida, estado: e.status === 404 ? "no-encontrado" : "error", product: null });
      });
    return () => {
      vigente = false;
    };
  }, [id, pedida]);

  function reintentar() {
    setIntento((n) => n + 1); // cambia la pedida: se ve "cargando" y se vuelve a pedir
  }

  if (estado !== "listo") {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        {estado === "cargando" && (
          <>
            <title>Cargando producto · PetConnect</title>
            <EstadoCarga tipo="cargando" encabezado="h1" titulo="Cargando producto…" />
          </>
        )}
        {estado === "no-encontrado" && (
          <>
            <title>Producto no encontrado · PetConnect</title>
            {/* Que los buscadores no guarden una ficha que no existe */}
            <meta name="robots" content="noindex" />
            <EstadoCarga tipo="vacio" encabezado="h1" titulo="Producto no encontrado" accion={VOLVER_CATALOGO}>
              Puede que ya no esté disponible en el catálogo.
            </EstadoCarga>
          </>
        )}
        {estado === "error" && (
          <>
            <title>No pudimos cargar el producto · PetConnect</title>
            <EstadoCarga
              tipo="error"
              encabezado="h1"
              titulo="No pudimos cargar este producto"
              onReintentar={reintentar}
              accion={VOLVER_CATALOGO}
            >
              Revisa tu conexión o inténtalo de nuevo en unos minutos.
            </EstadoCarga>
          </>
        )}
      </main>
    );
  }

  const precio = formatearPrecio(product.price);
  const categoria = textoLimpio(product.category);
  const descripcion = textoLimpio(product.description);
  // Misma regla que la tarjeta (#6): stock 0 o "0" es agotado. Si la API no
  // mandara stock, no se bloquea y no se muestra la fila de disponibilidad.
  const agotado = Number(product.stock) <= 0;
  const conStock = agotado || Number.isFinite(Number(product.stock));
  // §3.6: la descripción de la pestaña son las primeras 150 letras.
  const descripcionMeta = resumir(descripcion, 150) || `${product.name}, en el catálogo de PetConnect.`;

  const handleAdd = () => {
    if (agotado) return; // doble barrera: el botón ya viene desactivado
    addItem(product);
  };

  return (
    <main className="page-enter mx-auto w-full max-w-7xl px-4 pb-16 pt-4 md:px-6 md:pt-6">
      {/* React 19 sube <title> y <meta> al <head> mientras la ficha está abierta (§3.6) */}
      <title>{`${product.name} · PetConnect`}</title>
      <meta name="description" content={descripcionMeta} />

      <Link
        to="/catalogo"
        className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-base text-tinta-suave no-underline hover:text-marca"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al catálogo
      </Link>

      <div className="mt-3 grid gap-6 md:mt-6 md:grid-cols-2 md:gap-10 lg:gap-14">
        {/* En escritorio la foto se queda a la vista mientras se lee una
            descripción larga (top-24 = debajo del encabezado fijo). */}
        <FotoConRespaldo
          src={product.image}
          alt={product.name}
          icono={Package}
          tono="marca"
          loading="eager"
          className="aspect-square w-full rounded-tarjeta border border-borde md:sticky md:top-24 md:self-start"
        />

        <div className="min-w-0">
          {/* Nombre completo (en la tarjeta va cortado a 2 líneas) */}
          <h1 className="font-display text-2xl font-normal leading-tight text-balance break-words text-tinta md:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          {precio && (
            <p className="mt-3 text-2xl font-semibold tabular-nums text-tinta md:text-3xl">{precio}</p>
          )}

          {/* Datos del producto. Antes la categoría era una etiqueta en
              MAYÚSCULAS encima del título (eyebrow); ahora es un dato más. */}
          {(categoria || conStock) && (
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
              {categoria && (
                <>
                  <dt className="text-tinta-suave">Categoría</dt>
                  <dd className="min-w-0 break-words text-tinta">{categoria}</dd>
                </>
              )}
              {conStock && (
                <>
                  <dt className="text-tinta-suave">Disponibilidad</dt>
                  <dd className="flex items-center gap-2 text-tinta">
                    {agotado ? (
                      <PackageX className="h-5 w-5 shrink-0 text-error" aria-hidden="true" />
                    ) : (
                      <CircleCheck className="h-5 w-5 shrink-0 text-exito" aria-hidden="true" />
                    )}
                    {agotado ? "Agotado" : textoDisponible(product.stock)}
                  </dd>
                </>
              )}
            </dl>
          )}

          <div className="mt-6">
            {agotado ? (
              // Desactivado de verdad (no solo gris): el texto dice por qué.
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-control border border-borde bg-papel px-6 text-base font-semibold text-tinta-suave sm:w-auto"
              >
                <PackageX className="h-5 w-5 shrink-0" aria-hidden="true" />
                Agotado
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="presionable inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-marca px-6 text-base font-semibold text-superficie hover:bg-marca-hover sm:w-auto"
              >
                <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden="true" />
                Agregar al carrito
              </button>
            )}
          </div>

          {/* whitespace-pre-line respeta los saltos de línea que escribió quien
              cargó el producto. Si viene vacía, no se dibuja la sección. */}
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
    </main>
  );
}
