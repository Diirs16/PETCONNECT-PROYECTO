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
