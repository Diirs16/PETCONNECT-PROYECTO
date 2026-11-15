import { Package, PackageX, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { showAddToCartToast } from "../assets/js/addToCartToast";
import FotoConRespaldo from "./FotoConRespaldo";
import { formatearPrecio } from "../utils/precio";

// Fase 3 del rediseño: tarjeta de producto sobria (la emotiva será la de
// mascota, Fase 7). Solo muestra lo que manda la API: foto, nombre, precio y
// stock. Antes tenía "Nuevo", "-20 %" y precio anterior, que la BD no tiene (#41).
//
// En celular (< 640 px) es horizontal: foto pequeña a la izquierda, así se ven
// varios productos a la vez. Desde 640 px es vertical, en rejilla.

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const enlace = `/producto/${product.id}`;
  const precio = formatearPrecio(product.price);
  // #6: con stock 0 no se puede agregar. Si la API no mandara stock, no se
  // bloquea (Number(undefined) es NaN y NaN <= 0 es false).
  const agotado = Number(product.stock) <= 0;

  const handleAdd = () => {
    if (agotado) return;
    addItem(product);
    showAddToCartToast(product.name);
  };

  return (
    <article className="flex h-full overflow-hidden rounded-tarjeta border border-borde bg-superficie sm:flex-col">
      {/* La foto lleva al mismo lugar que el nombre: se salta con Tab
          (tabIndex -1) y el lector de pantalla no la repite. */}
      <Link
        to={enlace}
        tabIndex={-1}
        aria-hidden="true"
        className="block w-24 shrink-0 min-[360px]:w-28 sm:w-full"
      >
        <FotoConRespaldo
          src={product.image}
          alt=""
          icono={Package}
          tono="marca"
          className="h-full min-h-28 w-full sm:aspect-[4/3] sm:h-auto sm:min-h-0"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:gap-2 sm:p-4">
        <Link
          to={enlace}
          title={product.name}
          className="line-clamp-2 text-base font-semibold leading-snug text-pretty text-tinta no-underline underline-offset-4 hover:underline"
        >
          {product.name}
        </Link>

        {precio && <p className="text-lg font-semibold tabular-nums text-tinta">{precio}</p>}

        {agotado ? (
          // Desactivado de verdad (no solo gris): el texto dice por qué.
          <button
            type="button"
            disabled
            className="mt-auto inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-control border border-borde bg-papel px-3 text-sm font-semibold text-tinta-suave"
          >
            <PackageX className="h-4 w-4 shrink-0" aria-hidden="true" />
            Agotado
            <span className="sr-only">: {product.name}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="presionable mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-marca px-3 text-sm font-semibold text-superficie hover:bg-marca-hover"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden="true" />
            Agregar al carrito
            {/* El lector de pantalla dice cuál: hay muchos botones iguales */}
            <span className="sr-only">: {product.name}</span>
          </button>
        )}
      </div>
    </article>
  );
}
