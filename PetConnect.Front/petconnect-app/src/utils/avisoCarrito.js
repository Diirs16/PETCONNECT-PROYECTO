// Fase 5 del rediseño (#19): aviso "agregado al carrito".
//
// Antes (addToCartToast.js) el aviso se creaba con el DOM a mano JUNTO con su
// role="status", y la mayoría de lectores de pantalla no anuncian una zona que
// nace con el texto ya puesto. Ahora la zona role="status" está siempre en la
// página (src/components/AvisoCarrito.jsx, montada en App.jsx) y aquí solo se
// guarda QUÉ decir. Lo llama el carrito (src/context/CartContext.jsx) al agregar.
//
// Ítem 6.4 (XSS): el nombre del producto es texto. React lo pinta como texto
// (nunca como HTML) y tests/aviso-carrito.test.js vigila que nadie escriba
// HTML crudo en src/ (innerHTML y parecidos).
//
// Es un "almacén" mínimo (sin librerías): avisar() cambia el aviso y le cuenta
// a quien esté escuchando (AvisoCarrito, con useSyncExternalStore).

import { MAX_PRODUCTOS } from "./carrito.js";

/** Cuánto se ve el aviso. */
export const DURACION_AVISO_MS = 4000;

/**
 * Resultado de addItem → { tipo, titulo }. tipo "exito" (se agregó) o "info"
 * (no se agregó y aquí se dice por qué). El nombre va aparte, en su propia línea.
 */
export function textoAviso(resultado, maximo) {
  switch (resultado) {
    case "agregado":
      return { tipo: "exito", titulo: "Agregado al carrito" };
    case "tope":
      return {
        tipo: "info",
        titulo: maximo === 1 ? "Ya tienes la única unidad disponible" : `Ya tienes las ${maximo} unidades disponibles`,
      };
    case "agotado":
      return { tipo: "info", titulo: "Este producto está agotado" };
    case "lleno":
      return { tipo: "info", titulo: `Tu carrito ya tiene ${MAX_PRODUCTOS} productos distintos` };
    default:
      return null;
  }
}

const VACIO = { n: 0, tipo: null, titulo: "", nombre: "" };
let actual = VACIO;
const oyentes = new Set();

function contar() {
  for (const oyente of oyentes) oyente();
}

/** Muestra un aviso. Cada aviso lleva un número nuevo (n), aunque repita el texto. */
export function avisar(resultado, nombre, maximo) {
  const texto = textoAviso(resultado, maximo);
  if (!texto) return;
  actual = { n: actual.n + 1, ...texto, nombre: typeof nombre === "string" ? nombre : "" };
  contar();
}

/** Borra el aviso número n (si ya llegó otro más nuevo, no lo borra). */
export function limpiarAviso(n) {
  if (actual.n !== n || actual.titulo === "") return;
  actual = { ...VACIO, n: actual.n };
  contar();
}

export function suscribirAviso(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export const leerAviso = () => actual;
