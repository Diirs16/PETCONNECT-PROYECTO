import { useRef, useState } from "react";
import { Check, Info, Search, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import EstadoCarga from "../components/EstadoCarga";
import BotonVerMas from "../components/BotonVerMas";
import { useListaPaginada } from "../hooks/useListaPaginada";
import { getProductos } from "../services/api";
import { POR_PAGINA_CATALOGO } from "../utils/paginacion";
import { coincideBusqueda } from "../utils/texto";

// Fase 3 del rediseño. Sin aparición escalonada al bajar (§3.4): el catálogo
// se usa para comparar productos y la animación solo estorbaba.

const TODOS = "Todos";

// Chip de categoría. El activo se marca con color, borde Y un ícono ✓, para no
// depender solo del color (#18). Sin "scale": hacía saltar la fila.
const chip =
  "presionable inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold";
const chipActivo = "border-marca bg-marca-claro text-marca";
const chipInactivo = "border-borde-fuerte bg-superficie text-tinta hover:border-marca hover:text-marca";

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(TODOS);
  const buscador = useRef(null);
  // 3.3 (A-23): los productos y sus categorías salen SOLO de la API. Antes, si
  // la API fallaba o no traía nada, se quedaban los 12 productos inventados.
  // 4.17 (NC-003): se piden de 50 en 50 (el máximo de la API). El buscador y las
  // categorías filtran los productos YA cargados; si quedan más, un aviso lo dice.
  const {
    items: products,
    estado,
    reintentar,
    hayMas,
    verMas,
    cargandoMas,
    errorMas,
  } = useListaPaginada(getProductos, POR_PAGINA_CATALOGO);

  const filtrando = search.trim() !== "" || category !== TODOS;

  const categories = [TODOS, ...new Set(products.map((p) => p.category).filter(Boolean))];

  // #40: la búsqueda no distingue tildes ("algodon" encuentra "Algodón").
  const filtered = products.filter(
    (p) =>
      coincideBusqueda(p.name, search) && (category === TODOS || p.category === category),
  );

  // #39: salida del "sin resultados". Devuelve el foco al buscador para que
  // quien usa teclado siga desde ahí.
  function quitarFiltros() {
    setSearch("");
    setCategory(TODOS);
    buscador.current?.focus();
  }

  return (
    <main className="page-enter mx-auto w-full max-w-7xl px-4 pb-12 pt-8 md:px-6 md:pb-20 md:pt-12">
      {/* React 19 sube <title> y <meta> al <head> mientras el catálogo está abierto (§3.6) */}
      <title>Catálogo de productos · PetConnect</title>
      <meta name="description" content="Alimento, accesorios y cuidado para tu mascota." />

      <h1 className="font-display text-3xl font-normal tracking-tight text-balance text-tinta md:text-4xl">
        Catálogo de productos
      </h1>
      <p className="mt-2 max-w-[60ch] text-base text-pretty text-tinta-suave">
        Alimento, accesorios y cuidado para tu mascota.
      </p>

      <div className="mt-8">
        {estado === "cargando" && <EstadoCarga tipo="cargando" titulo="Cargando productos…" />}

        {estado === "error" && (
          <EstadoCarga
            tipo="error"
            titulo="No pudimos cargar el catálogo"
            onReintentar={reintentar}
          >
            Revisa tu conexión o inténtalo de nuevo en unos minutos.
          </EstadoCarga>
        )}

        {estado === "listo" && products.length === 0 && (
          <EstadoCarga tipo="vacio" titulo="Todavía no hay productos en el catálogo">
            Vuelve pronto: aquí aparecerán los productos disponibles.
          </EstadoCarga>
        )}

        {estado === "listo" && products.length > 0 && (
          <>
            <div className="flex flex-col gap-4 border-b border-borde pb-6 lg:flex-row lg:items-start lg:gap-6">
              {/* #14 y #15: letra de 16 px (el iPhone no hace zoom), borde que
                  se ve (3,8:1) y el foco del sitio (index.css), sin quitarlo. */}
              <div className="relative w-full lg:max-w-sm lg:shrink-0">
                <label htmlFor="buscar-productos" className="sr-only">
                  Buscar productos
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-tinta-suave"
                  aria-hidden="true"
                />
                <input
                  ref={buscador}
                  id="buscar-productos"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre"
                  autoComplete="off"
                  className="min-h-11 w-full rounded-control border border-borde-fuerte bg-superficie py-2 pl-10 pr-3 text-base text-tinta placeholder:text-tinta-suave"
                />
              </div>

              {/* #18: aria-pressed le dice al lector de pantalla cuál está activo */}
              <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const activo = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={activo}
                      onClick={() => setCategory(cat)}
                      className={`${chip} ${activo ? chipActivo : chipInactivo}`}
                    >
                      {activo && <Check className="h-4 w-4" aria-hidden="true" />}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* El lector de pantalla anuncia cuántos quedan al buscar o filtrar */}
            <p aria-live="polite" className="mb-4 mt-4 text-sm tabular-nums text-tinta-suave">
              {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
            </p>

            {filtered.length === 0 ? (
              <EstadoCarga
                tipo="vacio"
                titulo="Ningún producto coincide"
                accion={
                  <button
                    type="button"
                    onClick={quitarFiltros}
                    className="presionable inline-flex min-h-11 items-center gap-2 rounded-control border border-borde-fuerte bg-superficie px-5 text-base font-semibold text-tinta hover:border-marca hover:text-marca"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Quitar filtros
                  </button>
                }
              >
                Prueba con otra palabra o elige otra categoría.
              </EstadoCarga>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {hayMas && filtrando && (
              <p className="mt-8 flex items-start justify-center gap-2 text-center text-sm text-tinta-suave">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  La búsqueda revisa los {products.length} productos cargados. Pulsa «Ver más
                  productos» para buscar también en el resto.
                </span>
              </p>
            )}

            <BotonVerMas
              hayMas={hayMas}
              cargando={cargandoMas}
              error={errorMas}
              onVerMas={verMas}
              texto="Ver más productos"
            />
          </>
        )}
      </div>
    </main>
  );
}
