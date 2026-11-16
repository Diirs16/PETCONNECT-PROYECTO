import { createContext, useContext } from "react";

// Fase 5 del rediseño (#32): el contexto y el hook van en su propio archivo.
// Así CartContext.jsx solo exporta el componente CartProvider (lo pide la regla
// del lint "only-export-components" para que el recargado rápido de Vite funcione).
export const CartContext = createContext(null);

/** Datos y acciones del carrito. Solo funciona dentro de <CartProvider> (main.jsx). */
export function useCart() {
  const carrito = useContext(CartContext);
  if (!carrito) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return carrito;
}
