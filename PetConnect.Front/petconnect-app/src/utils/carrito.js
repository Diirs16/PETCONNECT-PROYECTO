// Fase 5 del rediseño: reglas del carrito como funciones "puras" (reciben datos
// y devuelven datos nuevos, sin tocar la pantalla). Así se prueban con
// `npm test` sin navegador (tests/carrito.test.js). Las usa
// src/context/CartContext.jsx.
//
// Qué se guarda en localStorage (#5): SOLO el id y la cantidad de cada
// producto. Nada personal (Ley 1581). El nombre, el precio, la foto y el stock
// se vuelven a pedir a la API al cargar la página, porque pudieron cambiar.
//
// Forma de cada producto en el carrito (la misma que ya leía Checkout):
//   { id, quantity, name, price, image, stock }
// Mientras la API no responde, el producto guardado queda "pendiente":
//   { id, quantity, pendiente: true }

export const CLAVE_CARRITO = "petconnect:carrito";

/** Productos distintos como máximo: evita miles de llamadas a la API si alguien edita localStorage a mano. */
export const MAX_PRODUCTOS = 50;

/** Tope cuando la API no manda un stock numérico (no se bloquea, pero tampoco es infinito). */
export const MAX_SIN_STOCK = 99;

/** Cantidad máxima que se acepta al leer lo guardado (antes de conocer el stock real). */
const MAX_CANTIDAD_GUARDADA = 9999;

const mismoId = (a, b) => String(a) === String(b);

/**
 * Cuántas unidades se pueden tener de un producto (#6). Misma regla que la
 * tarjeta y la ficha: stock 0, "0" o null es agotado (devuelve 0). Si la API no
 * mandara stock (undefined, "abc"), no se bloquea: el tope es MAX_SIN_STOCK.
 */
export function topeDeStock(stock) {
  const n = Number(stock);
  if (!Number.isFinite(n)) return MAX_SIN_STOCK;
  return Math.max(0, Math.floor(n));
}

/** Datos del producto que muestra el carrito, tomados de la respuesta de la API. */
function datosDe(producto) {
  return {
    id: producto.id,
    name: producto.name,
    price: producto.price,
    image: producto.image,
    stock: producto.stock,
  };
}

// --- Leer y guardar en localStorage ---

/**
 * Devuelve window.localStorage o null. En algunos navegadores (modo privado,
 * sitios bloqueados) solo LEER la propiedad ya lanza un error.
 */
export function obtenerAlmacen(ventana = globalThis) {
  try {
    return ventana.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Convierte un id guardado en número entero positivo, o null si no sirve. */
function idValido(valor) {
  const n = typeof valor === "string" && valor.trim() !== "" ? Number(valor) : valor;
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/**
 * Texto guardado → lista de productos pendientes. Nunca lanza error: si el
 * JSON está roto o trae basura, devuelve [] o solo lo que sí sirve. Junta ids
 * repetidos (suma las cantidades) y se queda con MAX_PRODUCTOS como máximo.
 */
export function interpretarGuardado(texto) {
  if (typeof texto !== "string" || texto === "") return [];
  let datos;
  try {
    datos = JSON.parse(texto);
  } catch {
    return [];
  }
  if (!Array.isArray(datos)) return [];

  const porId = new Map();
  for (const fila of datos) {
    if (!fila || typeof fila !== "object") continue;
    const id = idValido(fila.id);
    const cantidad = Math.floor(Number(fila.cantidad));
    if (id === null || !Number.isFinite(cantidad) || cantidad < 1) continue;
    const antes = porId.get(id) ?? 0;
    if (!porId.has(id) && porId.size >= MAX_PRODUCTOS) continue;
    porId.set(id, Math.min(antes + cantidad, MAX_CANTIDAD_GUARDADA));
  }
  return [...porId].map(([id, quantity]) => ({ id, quantity, pendiente: true }));
}

/** Lee el carrito guardado. Si localStorage falla o no existe, carrito vacío. */
export function leerGuardado(almacen) {
  try {
    return interpretarGuardado(almacen?.getItem(CLAVE_CARRITO) ?? null);
  } catch {
    return [];
  }
}

/** Lo único que se guarda: [{ id, cantidad }]. */
export function serializar(items) {
  return JSON.stringify(items.map((i) => ({ id: i.id, cantidad: i.quantity })));
}

/**
 * Guarda el carrito (o borra la clave si quedó vacío). Devuelve false si no se
 * pudo (localStorage bloqueado o lleno): el carrito sigue funcionando en memoria.
 */
export function guardar(almacen, items) {
  if (!almacen) return false;
  try {
    if (items.length === 0) almacen.removeItem(CLAVE_CARRITO);
    else almacen.setItem(CLAVE_CARRITO, serializar(items));
    return true;
  } catch {
    return false;
  }
}

// --- Cambiar el carrito ---

/**
 * Suma una unidad de `producto` (#6: nunca más que el stock).
 * resultado: "agregado" | "agotado" (stock 0) | "tope" (ya tiene todas las
 * unidades) | "lleno" (ya hay MAX_PRODUCTOS distintos). `maximo` es el tope.
 * Si no se agregó, `items` es la MISMA lista (nada cambia).
 */
export function agregar(items, producto) {
  const maximo = topeDeStock(producto.stock);
  if (maximo <= 0) return { items, resultado: "agotado", maximo };

  const actual = items.find((i) => mismoId(i.id, producto.id));
  if (actual) {
    if (actual.quantity >= maximo) {
      // Si estaba pendiente o con más de lo que hay, se corrige con estos datos frescos
      const corregir = actual.pendiente || actual.quantity > maximo;
      const nuevos = corregir
        ? items.map((i) => (i === actual ? { ...datosDe(producto), quantity: maximo } : i))
        : items;
      return { items: nuevos, resultado: "tope", maximo };
    }
    const nuevos = items.map((i) =>
      i === actual ? { ...datosDe(producto), quantity: i.quantity + 1 } : i,
    );
    return { items: nuevos, resultado: "agregado", maximo };
  }

  if (items.length >= MAX_PRODUCTOS) return { items, resultado: "lleno", maximo };
  return { items: [...items, { ...datosDe(producto), quantity: 1 }], resultado: "agregado", maximo };
}

/**
 * Pone la cantidad de un producto entre 1 y su stock. Para quitarlo está
 * `quitar` (el botón "−" no baja de 1). Si nada cambia, devuelve la misma lista.
 */
export function cambiarCantidad(items, id, cantidad) {
  let cambio = false;
  const nuevos = items.map((i) => {
    if (!mismoId(i.id, id)) return i;
    const pedida = Math.floor(Number(cantidad));
    if (!Number.isFinite(pedida)) return i;
    const limpia = Math.min(Math.max(pedida, 1), Math.max(topeDeStock(i.stock), 1));
    if (limpia === i.quantity) return i;
    cambio = true;
    return { ...i, quantity: limpia };
  });
  return cambio ? nuevos : items;
}

export function quitar(items, id) {
  const nuevos = items.filter((i) => !mismoId(i.id, id));
  return nuevos.length === items.length ? items : nuevos;
}

// --- Totales ---

/** Unidades de todo el carrito (también las pendientes): es el número del ícono. */
export function totalUnidades(items) {
  return items.reduce((suma, i) => suma + i.quantity, 0);
}

/** Total en pesos de los productos que ya tienen precio de la API. */
export function totalPrecio(items) {
  return items.reduce((suma, i) => {
    const precio = Number(i.price);
    return i.pendiente || !Number.isFinite(precio) ? suma : suma + precio * i.quantity;
  }, 0);
}

// --- Ajustar lo guardado con lo que dice la API ---

/**
 * Resultado de Promise.allSettled(getProducto(id)) → qué se sabe del producto:
 * { tipo: "ok", producto } | { tipo: "no-existe" } (404) | { tipo: "error" }.
 */
export function resultadoDeApi(asentado) {
  if (asentado?.status === "fulfilled") {
    const producto = asentado.value;
    return producto && typeof producto === "object" ? { tipo: "ok", producto } : { tipo: "error" };
  }
  return asentado?.reason?.status === 404 ? { tipo: "no-existe" } : { tipo: "error" };
}

/**
 * Completa los productos pendientes con los datos de la API (decisión 1 del
 * plan de la Fase 5). `resultados` es un Map de id (texto) → resultadoDeApi.
 * - Ya no existe (404) o agotado: se quita y se anota el cambio.
 * - Menos stock que lo guardado: la cantidad baja al stock y se anota.
 * - Error de red (o sin respuesta): queda pendiente, NO se borra (huboError).
 * Los productos que no estaban pendientes no se tocan.
 */
export function ajustarConApi(items, resultados) {
  const cambios = [];
  let huboError = false;
  const nuevos = [];

  for (const item of items) {
    if (!item.pendiente) {
      nuevos.push(item);
      continue;
    }
    const r = resultados.get(String(item.id));
    if (!r || r.tipo === "error") {
      huboError = true;
      nuevos.push(item);
      continue;
    }
    if (r.tipo === "no-existe") {
      cambios.push({ tipo: "no-existe" });
      continue;
    }
    const maximo = topeDeStock(r.producto.stock);
    const nombre = r.producto.name;
    if (maximo <= 0) {
      cambios.push({ tipo: "agotado", nombre });
      continue;
    }
    const quantity = Math.min(item.quantity, maximo);
    if (quantity < item.quantity) cambios.push({ tipo: "ajustado", nombre, cantidad: quantity });
    nuevos.push({ ...datosDe(r.producto), id: item.id, quantity });
  }

  return { items: nuevos, cambios, huboError };
}

/**
 * Cambios → frases para el aviso del carrito. Los productos que ya no existen
 * se cuentan juntos (la API no dice cómo se llamaban).
 */
export function textoCambios(cambios) {
  const frases = [];
  const borrados = cambios.filter((c) => c.tipo === "no-existe").length;
  if (borrados === 1) frases.push("1 producto ya no está en el catálogo y se quitó.");
  if (borrados > 1) frases.push(`${borrados} productos ya no están en el catálogo y se quitaron.`);
  for (const c of cambios) {
    if (c.tipo === "agotado") frases.push(`«${c.nombre}» se agotó y se quitó.`);
    if (c.tipo === "ajustado") {
      const unidades = c.cantidad === 1 ? "1 unidad" : `${c.cantidad} unidades`;
      frases.push(`«${c.nombre}» bajó a ${unidades}: es lo que hay disponible.`);
    }
  }
  return frases;
}
