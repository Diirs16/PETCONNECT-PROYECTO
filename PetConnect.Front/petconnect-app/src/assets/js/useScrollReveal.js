import { useEffect } from "react";
import { initScrollReveal } from "./scrollReveal";

// Hace aparecer los elementos con la clase "scroll-reveal" al entrar en pantalla.
//
// Corre después de CADA render a propósito (por eso no lleva lista de
// dependencias): Catálogo y Adopción dibujan sus tarjetas cuando llega la
// respuesta de la API, en un render posterior. Con una lista vacía [] esas
// tarjetas nunca se observarían y quedarían invisibles.
//
// Arreglo de la Fase 1 (#20): antes la limpieza se devolvía dentro de un
// setTimeout, donde React la ignora, y cada render dejaba un observador vivo.
// Ahora cada render desconecta el observador anterior antes de crear el nuevo.
export function useScrollReveal() {
  useEffect(() => initScrollReveal());
}
