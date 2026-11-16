import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getProducto } from "../services/api";
import { CartContext } from "./useCart";
import {
  agregar,
  ajustarConApi,
  cambiarCantidad,
  guardar,
  leerGuardado,
  obtenerAlmacen,
  quitar,
  resultadoDeApi,
  totalPrecio as calcularTotalPrecio,
  totalUnidades,
} from "../utils/carrito";
import { avisar } from "../utils/avisoCarrito";

// Fase 5 del rediseño. Las reglas (tope de stock, leer y guardar) están en
// src/utils/carrito.js, con pruebas. Aquí solo se conectan con React.
//
// - #5: el carrito se guarda en localStorage (solo id y cantidad) y sobrevive a
//   recargar. Al cargar la página se piden a la API el nombre, el precio, la foto
//   y el stock de cada producto guardado (una llamada por producto, decisión 3).
// - #6: nunca más unidades que el stock; un agotado no entra.
// - #32: el valor del contexto se memoriza (useMemo/useCallback). Antes era un
//   objeto nuevo en cada render y cada tarjeta del catálogo se volvía a dibujar.
// - Al cerrar sesión el carrito se conserva (decisión 2): no tiene datos personales.

export function CartProvider({ children }) {
  const [almacen] = useState(obtenerAlmacen);
  const [items, setItems] = useState(() => leerGuardado(almacen));
  // "cargando" mientras la API completa lo guardado; "error" si no respondió
  // (lo guardado NO se borra); "listo" en los demás casos.
  const [estadoCarrito, setEstadoCarrito] = useState(() =>
    items.some((i) => i.pendiente) ? "cargando" : "listo",
  );
  // Cambios hechos al ajustar con la API (agotados, borrados, menos stock).
  // El carrito los muestra en un aviso y los descarta al cerrarse.
  const [cambiosCarrito, setCambiosCarrito] = useState([]);
  const [intento, setIntento] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Copia siempre al día de la lista: addItem necesita saber el resultado
  // ("agregado", "tope"...) en el mismo clic, sin esperar al siguiente render.
  const itemsRef = useRef(items);
  const aplicar = useCallback((nuevos) => {
    if (nuevos === itemsRef.current) return;
    itemsRef.current = nuevos;
    setItems(nuevos);
  }, []);

  // Guardar cada vez que cambia (si localStorage está bloqueado, sigue en memoria)
  useEffect(() => {
    guardar(almacen, items);
  }, [almacen, items]);

  // Completar lo guardado con la API: al cargar y con "Reintentar"
  useEffect(() => {
    const pendientes = itemsRef.current.filter((i) => i.pendiente);
    if (pendientes.length === 0) return undefined;
    let vigente = true;
    Promise.allSettled(pendientes.map((i) => getProducto(i.id))).then((respuestas) => {
      if (!vigente) return;
      const resultados = new Map(
        pendientes.map((i, k) => [String(i.id), resultadoDeApi(respuestas[k])]),
      );
      const ajuste = ajustarConApi(itemsRef.current, resultados);
      aplicar(ajuste.items);
      if (ajuste.cambios.length > 0) setCambiosCarrito((antes) => [...antes, ...ajuste.cambios]);
      setEstadoCarrito(ajuste.huboError ? "error" : "listo");
    });
    return () => {
      vigente = false;
    };
  }, [intento, aplicar]);

  const reintentarCarrito = useCallback(() => {
    setEstadoCarrito("cargando");
    setIntento((n) => n + 1);
  }, []);

  /**
   * Suma una unidad y muestra el aviso (#19). Como aquí se sabe si de verdad se
   * agregó, el aviso nunca dice "agregado" cuando ya no quedaban unidades.
   * Devuelve "agregado", "agotado", "tope" o "lleno" (ver agregar en
   * utils/carrito.js) y el máximo disponible.
   */
  const addItem = useCallback(
    (product) => {
      const r = agregar(itemsRef.current, product);
      aplicar(r.items);
      avisar(r.resultado, product.name, r.maximo);
      return { resultado: r.resultado, maximo: r.maximo };
    },
    [aplicar],
  );

  const removeItem = useCallback((id) => aplicar(quitar(itemsRef.current, id)), [aplicar]);

  const updateQuantity = useCallback(
    (id, quantity) => aplicar(cambiarCantidad(itemsRef.current, id, quantity)),
    [aplicar],
  );

  const clearCart = useCallback(() => aplicar([]), [aplicar]);

  const descartarCambios = useCallback(() => setCambiosCarrito([]), []);

  const valor = useMemo(() => {
    // Las páginas (CartModal, Checkout) solo ven los productos que ya tienen
    // nombre y precio. El número del ícono cuenta también los pendientes.
    const cargados = items.filter((i) => !i.pendiente);
    return {
      items: cargados,
      estadoCarrito,
      cambiosCarrito,
      descartarCambios,
      reintentarCarrito,
      isOpen,
      setIsOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems: totalUnidades(items),
      totalPrice: calcularTotalPrecio(cargados),
    };
  }, [
    items,
    estadoCarrito,
    cambiosCarrito,
    descartarCambios,
    reintentarCarrito,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  ]);

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}
