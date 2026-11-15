// Búsqueda que no distingue tildes ni mayúsculas (Fase 3 del rediseño, #40).
// Antes "algodon" no encontraba "Algodón".
//
// normalize("NFD") separa cada letra de su tilde ("ó" → "o" + "´") y luego se
// borran las tildes sueltas. Ojo: la ñ también se vuelve n, así que "pequeno"
// encuentra "pequeño" (es lo que se espera de un buscador).

/** "Algodón Ñandú" → "algodon nandu". Lo que no es texto se trata como "". */
export function normalizarTexto(texto) {
  if (typeof texto !== "string") return "";
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** true si `texto` contiene `busqueda`, sin importar tildes, mayúsculas ni espacios al borde. */
export function coincideBusqueda(texto, busqueda) {
  const buscado = normalizarTexto(busqueda).trim();
  if (buscado === "") return true;
  return normalizarTexto(texto).includes(buscado);
}

/**
 * Resumen corto para la descripción de la pestaña (Fase 4, §3.6).
 * Junta los saltos de línea y espacios repetidos en uno solo y, si el texto
 * pasa de `maximo` letras, lo corta en el último espacio (para no partir una
 * palabra) y agrega "…". El resultado nunca pasa de `maximo` letras.
 * Lo que no es texto devuelve "".
 */
export function resumir(texto, maximo = 150) {
  if (typeof texto !== "string") return "";
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= maximo) return limpio;
  const corte = limpio.slice(0, maximo - 1); // deja lugar para "…"
  const espacio = corte.lastIndexOf(" ");
  // Si no hay un espacio en la segunda mitad (una palabra larguísima), se corta ahí mismo.
  const base = espacio > maximo / 2 ? corte.slice(0, espacio) : corte;
  return `${base.replace(/[\s,.;:—–-]+$/u, "")}…`;
}
