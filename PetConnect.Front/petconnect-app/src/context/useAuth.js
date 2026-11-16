import { createContext, useContext } from "react";

// Fase 9 del rediseño (#32): el contexto y el hook van en su propio archivo, como
// useCart.js. Así AuthContext.jsx solo exporta el componente AuthProvider (lo pide
// la regla del lint "only-export-components" para que el recargado rápido de Vite
// funcione).
export const AuthContext = createContext(null);

/** Sesión y acciones de la cuenta. Solo funciona dentro de <AuthProvider> (main.jsx). */
export function useAuth() {
  const sesion = useContext(AuthContext);
  if (!sesion) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return sesion;
}
