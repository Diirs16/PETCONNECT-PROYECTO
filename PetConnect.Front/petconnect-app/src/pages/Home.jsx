import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, PawPrint, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import ProductCard from "../components/ProductCard";
import EstadoCarga from "../components/EstadoCarga";
import { getProductos } from "../services/api";
// Cuántos productos de la API se muestran en "Productos destacados".
import { POR_PAGINA_DESTACADOS } from "../utils/paginacion";

// Fase 1 del rediseño (D2): solo beneficios que la web ya cumple hoy.
// Antes prometía "envío en 24-48 h" y "garantía de devolución", que no existen (#2).
const beneficios = [
  {
    Icono: HeartHandshake,
    color: "text-acento",
    titulo: "Adopción en línea",
    texto:
      "Conoce a cada mascota y envía tu solicitud desde su ficha. Te respondemos al correo de tu cuenta.",
  },
  {
    Icono: ShoppingBag,
    color: "text-marca",
    titulo: "Lo que necesita, en un catálogo",
    texto: "Alimento, accesorios y cuidado para tu mascota, en un solo lugar.",
  },
  {
    Icono: ShieldCheck,
    color: "text-marca",
    titulo: "Tus datos, protegidos",
    texto: "Verificamos tu correo al entrar y tratamos tus datos según la Ley 1581 de 2012.",
  },
];

// Receta única de botón grande (adopción en terracota, catálogo en turquesa:
// mismo tamaño y mismo peso). "presionable" está en index.css.
const botonGrande =
  "presionable inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-5 text-base font-semibold text-superficie no-underline";

export default function Home() {
  // 3.3 (A-23): antes Home SIEMPRE usaba productos inventados de
  // data/products.js, con "descuento" y "nuevo", datos que la BD no tiene.
  // Ahora muestra los primeros productos reales de la API, en una sola sección.
  const [products, setProducts] = useState([]);
  const [estado, setEstado] = useState("cargando"); // "cargando" | "error" | "listo"
  const [intento, setIntento] = useState(0); // al sumar 1, se vuelve a pedir la lista

  useEffect(() => {
    let vigente = true; // evita actualizar la página si el usuario ya se fue
    // 4.17 (NC-003): pide solo los 4 que muestra. Antes pedía el catálogo entero
    // y se quedaba con los 4 primeros.
    getProductos({ pagina: 1, porPagina: POR_PAGINA_DESTACADOS })
      .then((data) => {
        if (!vigente) return;
        setProducts(data);
        setEstado("listo");
      })
      .catch(() => {
        if (vigente) setEstado("error");
      });
    return () => {
      vigente = false;
    };
  }, [intento]);

  function reintentar() {
    setEstado("cargando");
    setIntento((n) => n + 1);
  }

  return (
    <main>
      {/* React 19 sube <title> y <meta> al <head> mientras el Home está abierto (§3.6) */}
      <title>PetConnect · Adopción responsable y productos para mascotas</title>
      <meta
        name="description"
        content="Conoce mascotas que buscan hogar en el Quindío y productos para su cuidado."
      />

      {/* Portada: a la izquierda el título y las dos puertas; a la derecha (o
          debajo, en celular) lo que la web ya ofrece. */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-12 pt-10 md:px-6 md:pb-16 md:pt-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          {/* Corte fijo después de la coma: dos líneas en celular y escritorio */}
          <h1 className="font-display text-4xl font-normal leading-[1.08] tracking-tight text-tinta md:text-5xl lg:text-6xl">
            Cuida y adopta,{" "}
            <span className="block">en un solo lugar</span>
          </h1>
          <p className="mt-5 max-w-[60ch] text-base text-pretty text-tinta-suave md:text-lg">
            Conoce a las mascotas que buscan familia en el Quindío y encuentra
            alimento, accesorios y cuidado para la tuya.
          </p>
          <div className="mt-8 grid gap-3 sm:max-w-xl sm:grid-cols-2">
            <Link to="/adopcion" className={`${botonGrande} bg-acento hover:bg-acento-oscuro`}>
              <PawPrint className="h-5 w-5" aria-hidden="true" />
              Ver mascotas en adopción
            </Link>
            <Link to="/catalogo" className={`${botonGrande} bg-marca hover:bg-marca-hover`}>
              <Store className="h-5 w-5" aria-hidden="true" />
              Explorar catálogo
            </Link>
          </div>
        </div>

        <ul className="divide-y divide-borde border-y border-borde lg:col-span-5 lg:self-end lg:border-y-0 lg:border-l lg:pl-10">
          {beneficios.map(({ Icono, color, titulo, texto }) => (
            <li key={titulo} className="flex gap-4 py-5 lg:first:pt-0 lg:last:pb-0">
              <Icono className={`mt-0.5 h-6 w-6 shrink-0 ${color}`} aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold text-tinta">{titulo}</h2>
                <p className="mt-1 text-base text-pretty text-tinta-suave">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Productos destacados (de la API; 3.3) */}
      <section className="border-t border-borde">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 md:px-6 md:pb-20 md:pt-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <h2 className="font-display text-2xl font-normal text-balance text-tinta md:text-3xl">
              Productos destacados
            </h2>
            <Link
              to="/catalogo"
              className="inline-flex min-h-11 items-center text-base font-semibold text-marca underline-offset-4 hover:underline"
            >
              Ver todo el catálogo
            </Link>
          </div>
          {estado === "cargando" && <EstadoCarga tipo="cargando" titulo="Cargando productos…" />}
          {estado === "error" && (
            <EstadoCarga
              tipo="error"
              titulo="No pudimos cargar los productos"
              onReintentar={reintentar}
            >
              Revisa tu conexión o inténtalo de nuevo en unos minutos.
            </EstadoCarga>
          )}
          {estado === "listo" && products.length === 0 && (
            <EstadoCarga tipo="vacio" titulo="Todavía no hay productos en el catálogo" />
          )}
          {estado === "listo" && products.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Adopción: mismo peso que la tienda, con su color propio */}
      <section className="bg-acento-claro">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:gap-10 md:px-6 md:py-16">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-normal text-balance text-tinta md:text-3xl">
              Dale un hogar a quien lo necesita
            </h2>
            <p className="mt-3 text-base text-pretty text-tinta-suave">
              Cada mascota tiene su ficha con su historia. Si una encaja contigo,
              envía la solicitud desde ahí.
            </p>
          </div>
          <Link
            to="/adopcion"
            className={`${botonGrande} shrink-0 bg-acento hover:bg-acento-oscuro`}
          >
            <PawPrint className="h-5 w-5" aria-hidden="true" />
            Ver mascotas en adopción
          </Link>
        </div>
      </section>
    </main>
  );
}
