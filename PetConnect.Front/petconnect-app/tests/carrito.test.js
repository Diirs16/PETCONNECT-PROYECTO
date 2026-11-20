// Fase 5 del rediseño: reglas del carrito (src/utils/carrito.js).
// Tope de stock (#6), guardado en localStorage (#5) y ajuste con la API.
// Productos y datos inventados; en localStorage solo viajan id y cantidad.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CLAVE_CARRITO,
  MAX_PRODUCTOS,
  MAX_SIN_STOCK,
  agregar,
  ajustarConApi,
  cambiarCantidad,
  guardar,
  interpretarGuardado,
  leerGuardado,
  obtenerAlmacen,
  quitar,
  resultadoDeApi,
  serializar,
  textoCambios,
  topeDeStock,
  totalPrecio,
  totalUnidades,
} from "../src/utils/carrito.js";

const collar = { id: 7, name: "Collar reflectivo", price: 25000, image: null, stock: 3 };
const cama = { id: 9, name: "Cama mediana", price: "89900.50", image: "x.jpg", stock: 1 };

/** localStorage falso en memoria. */
function almacenFalso(inicial = {}) {
  const datos = new Map(Object.entries(inicial));
  return {
    datos,
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
    removeItem: (k) => datos.delete(k),
  };
}

/** localStorage bloqueado: todo lanza error (modo privado, cookies bloqueadas). */
const almacenBloqueado = {
  getItem() { throw new Error("SecurityError"); },
  setItem() { throw new Error("SecurityError"); },
  removeItem() { throw new Error("SecurityError"); },
};

// --- Tope de stock ---

test("topeDeStock: 0, '0' y null son agotado; sin stock numérico el tope es 99", () => {
  assert.equal(topeDeStock(3), 3);
  assert.equal(topeDeStock("5"), 5);
  assert.equal(topeDeStock(0), 0);
  assert.equal(topeDeStock("0"), 0);
  assert.equal(topeDeStock(null), 0);
  assert.equal(topeDeStock(-4), 0);
  assert.equal(topeDeStock(undefined), MAX_SIN_STOCK);
  assert.equal(topeDeStock("abc"), MAX_SIN_STOCK);
});

test("agregar: la primera vez entra con cantidad 1 y sin campos de más", () => {
  const { items, resultado } = agregar([], { ...collar, descripcion: "no se copia" });
  assert.equal(resultado, "agregado");
  assert.deepEqual(items, [{ id: 7, name: "Collar reflectivo", price: 25000, image: null, stock: 3, quantity: 1 }]);
});

test("agregar: nunca pasa del stock (stock 1 + segundo clic = tope, sin cambios)", () => {
  const uno = agregar([], cama);
  const dos = agregar(uno.items, cama);
  assert.equal(dos.resultado, "tope");
  assert.equal(dos.maximo, 1);
  assert.equal(dos.items, uno.items, "debe devolver la misma lista");
  assert.equal(dos.items[0].quantity, 1);
});

test("agregar: un producto agotado no entra", () => {
  for (const stock of [0, "0", null]) {
    const r = agregar([], { ...collar, stock });
    assert.equal(r.resultado, "agotado", `stock ${String(stock)}`);
    assert.deepEqual(r.items, []);
  }
});

test("agregar: con 50 productos distintos ya no entra otro nuevo", () => {
  const llenos = Array.from({ length: MAX_PRODUCTOS }, (_, i) => ({ ...collar, id: i + 1, quantity: 1 }));
  assert.equal(agregar(llenos, { ...collar, id: 999 }).resultado, "lleno");
  assert.equal(agregar(llenos, { ...collar, id: 1 }).resultado, "agregado", "uno que ya está sí suma");
});

test("agregar: si el guardado tenía más que el stock, lo corrige al tope", () => {
  const items = [{ id: 7, quantity: 999, pendiente: true }];
  const r = agregar(items, collar);
  assert.equal(r.resultado, "tope");
  assert.equal(r.items[0].quantity, 3);
  assert.equal(r.items[0].pendiente, undefined);
  assert.equal(r.items[0].name, "Collar reflectivo");
});

test("cambiarCantidad: queda entre 1 y el stock", () => {
  const items = [{ ...collar, quantity: 2 }];
  assert.equal(cambiarCantidad(items, 7, 3)[0].quantity, 3);
  assert.equal(cambiarCantidad(items, 7, 999)[0].quantity, 3, "999 con stock 3");
  assert.equal(cambiarCantidad(items, 7, 0)[0].quantity, 1, "el − no baja de 1");
  assert.equal(cambiarCantidad(items, 7, 2), items, "sin cambio = misma lista");
  assert.equal(cambiarCantidad(items, 7, "abc"), items);
  assert.equal(cambiarCantidad(items, 123, 2), items, "id que no está");
});

test("quitar: borra solo ese producto", () => {
  const items = [{ ...collar, quantity: 1 }, { ...cama, quantity: 1 }];
  assert.deepEqual(quitar(items, 7).map((i) => i.id), [9]);
  assert.equal(quitar(items, 123), items);
});

test("totales: unidades cuentan las pendientes; el precio solo las que tienen precio", () => {
  const items = [
    { ...collar, quantity: 2 },
    { ...cama, quantity: 1 },
    { id: 5, quantity: 125, pendiente: true },
  ];
  assert.equal(totalUnidades(items), 128);
  assert.equal(totalPrecio(items), 2 * 25000 + 89900.5);
});

// --- localStorage ---

test("serializar: solo id y cantidad (nada de nombre, precio ni foto)", () => {
  const texto = serializar([{ ...collar, quantity: 2 }]);
  assert.deepEqual(JSON.parse(texto), [{ id: 7, cantidad: 2 }]);
});

test("guardar y leer: ida y vuelta", () => {
  const almacen = almacenFalso();
  assert.equal(guardar(almacen, [{ ...collar, quantity: 2 }, { ...cama, quantity: 1 }]), true);
  assert.deepEqual(leerGuardado(almacen), [
    { id: 7, quantity: 2, pendiente: true },
    { id: 9, quantity: 1, pendiente: true },
  ]);
});

test("guardar un carrito vacío borra la clave", () => {
  const almacen = almacenFalso({ [CLAVE_CARRITO]: "[]" });
  guardar(almacen, []);
  assert.equal(almacen.datos.has(CLAVE_CARRITO), false);
});

test("JSON roto o con basura: no rompe, se queda con lo que sirve", () => {
  assert.deepEqual(interpretarGuardado("{esto no es json"), []);
  assert.deepEqual(interpretarGuardado('{"id":1}'), []);
  assert.deepEqual(interpretarGuardado(null), []);
  const texto = JSON.stringify([
    { id: 7, cantidad: 2 },
    { id: "7", cantidad: 1 }, // repetido: se suma
    { id: -1, cantidad: 1 },
    { id: 1.5, cantidad: 1 },
    { id: "abc", cantidad: 1 },
    { id: 8, cantidad: 0 },
    { id: 9, cantidad: "x" },
    null,
    "texto",
    { id: 10, cantidad: 999 },
  ]);
  assert.deepEqual(interpretarGuardado(texto), [
    { id: 7, quantity: 3, pendiente: true },
    { id: 10, quantity: 999, pendiente: true },
  ]);
});

test("lo guardado no pasa de 50 productos distintos", () => {
  const muchos = Array.from({ length: 500 }, (_, i) => ({ id: i + 1, cantidad: 1 }));
  assert.equal(interpretarGuardado(JSON.stringify(muchos)).length, MAX_PRODUCTOS);
});

test("localStorage bloqueado: leer da carrito vacío y guardar devuelve false, sin lanzar", () => {
  assert.deepEqual(leerGuardado(almacenBloqueado), []);
  assert.equal(guardar(almacenBloqueado, [{ ...collar, quantity: 1 }]), false);
  assert.deepEqual(leerGuardado(null), []);
  assert.equal(guardar(null, []), false);
});

test("obtenerAlmacen: si leer window.localStorage lanza, devuelve null", () => {
  const ventana = {
    get localStorage() {
      throw new Error("SecurityError");
    },
  };
  assert.equal(obtenerAlmacen(ventana), null);
  const almacen = almacenFalso();
  assert.equal(obtenerAlmacen({ localStorage: almacen }), almacen);
});

// --- Ajuste con la API ---

test("resultadoDeApi: 404 = no existe; otro fallo = error", () => {
  assert.deepEqual(resultadoDeApi({ status: "fulfilled", value: collar }), { tipo: "ok", producto: collar });
  assert.deepEqual(resultadoDeApi({ status: "rejected", reason: { status: 404 } }), { tipo: "no-existe" });
  assert.deepEqual(resultadoDeApi({ status: "rejected", reason: { status: 500 } }), { tipo: "error" });
  assert.deepEqual(resultadoDeApi({ status: "rejected", reason: new TypeError("Failed to fetch") }), { tipo: "error" });
  assert.deepEqual(resultadoDeApi({ status: "fulfilled", value: null }), { tipo: "error" });
});

test("ajustarConApi: quita los que no existen o se agotaron y baja al stock", () => {
  const items = [
    { id: 1, quantity: 2, pendiente: true }, // sigue igual
    { id: 2, quantity: 1, pendiente: true }, // 404
    { id: 3, quantity: 4, pendiente: true }, // stock 0
    { id: 4, quantity: 999, pendiente: true }, // stock 1
    { ...collar, quantity: 1 }, // no pendiente: no se toca
  ];
  const resultados = new Map([
    ["1", { tipo: "ok", producto: { ...collar, id: 1 } }],
    ["2", { tipo: "no-existe" }],
    ["3", { tipo: "ok", producto: { ...collar, id: 3, name: "Cepillo", stock: 0 } }],
    ["4", { tipo: "ok", producto: { ...cama, id: 4 } }],
  ]);
  const r = ajustarConApi(items, resultados);
  assert.equal(r.huboError, false);
  assert.deepEqual(r.items.map((i) => [i.id, i.quantity, i.pendiente]), [
    [1, 2, undefined],
    [4, 1, undefined],
    [7, 1, undefined],
  ]);
  assert.equal(r.items[1].name, "Cama mediana");
  assert.deepEqual(r.cambios, [
    { tipo: "no-existe" },
    { tipo: "agotado", nombre: "Cepillo" },
    { tipo: "ajustado", nombre: "Cama mediana", cantidad: 1 },
  ]);
});

test("ajustarConApi: con error de red NO se borra nada", () => {
  const items = [{ id: 1, quantity: 2, pendiente: true }];
  const r = ajustarConApi(items, new Map([["1", { tipo: "error" }]]));
  assert.equal(r.huboError, true);
  assert.deepEqual(r.items, items);
  assert.deepEqual(ajustarConApi(items, new Map()).items, items, "sin respuesta tampoco");
});

test("textoCambios: frases en español, con plural", () => {
  assert.deepEqual(
    textoCambios([
      { tipo: "no-existe" },
      { tipo: "no-existe" },
      { tipo: "agotado", nombre: "Cepillo" },
      { tipo: "ajustado", nombre: "Cama", cantidad: 1 },
      { tipo: "ajustado", nombre: "Collar", cantidad: 3 },
    ]),
    [
      "2 productos ya no están en el catálogo y se quitaron.",
      "«Cepillo» se agotó y se quitó.",
      "«Cama» bajó a 1 unidad: es lo que hay disponible.",
      "«Collar» bajó a 3 unidades: es lo que hay disponible.",
    ],
  );
  assert.deepEqual(textoCambios([{ tipo: "no-existe" }]), ["1 producto ya no está en el catálogo y se quitó."]);
  assert.deepEqual(textoCambios([]), []);
});
