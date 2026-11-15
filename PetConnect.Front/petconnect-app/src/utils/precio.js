// Precio en pesos colombianos, en un solo lugar (Fase 3 del rediseño, #28).
// Antes cada archivo tenía su propia copia de formatPrice y, sin
// maximumFractionDigits, un precio con centavos salía "$ 89.900,5".
// En pesos no se usan centavos: se redondea al peso más cercano.
// Pendiente: CartModal (Fase 5) y Checkout (Fase 6) todavía tienen su propia
// copia; se cambian a este archivo en su fase. ProductCard (Fase 3) y
// ProductDetail (Fase 4) ya lo usan.

const FORMATO = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * 25000 → "$ 25.000"; 89900.5 → "$ 89.901". Acepta el precio como número o
 * como texto ("25000.00"). Si no es un número válido devuelve null, para que la
 * página no muestre un precio inventado.
 */
export function formatearPrecio(precio) {
  if (precio === null || precio === undefined || precio === "") return null;
  const numero = Number(precio);
  if (!Number.isFinite(numero)) return null;
  return FORMATO.format(numero);
}
