// Pruebas del aviso "agregado al carrito" (ítem 6.4 + Fase 5 del rediseño, #19).
// Se corren con `npm test` (node --test, sin dependencias nuevas).
//
// Historia: el aviso vivía en src/assets/js/addToCartToast.js y se armaba con
// el DOM a mano. En el ítem 6.4 (A-25) se quitó el innerHTML: un nombre como
// "<img src=x onerror=alert(1)>" se convertía en una etiqueta real y su código
// corría en la página (XSS). En la Fase 5 el aviso pasó a React:
//   - src/utils/avisoCarrito.js decide QUÉ decir (se prueba aquí directo).
//   - src/components/AvisoCarrito.jsx lo pinta como TEXTO dentro de una zona
//     role="status" que siempre existe (así el lector de pantalla lo anuncia).
// Node no entiende JSX, así que del componente se revisa el código fuente.
// La guardia de innerHTML en todo src/ se mantiene.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  avisar,
  leerAviso,
  limpiarAviso,
  suscribirAviso,
  textoAviso,
} from "../src/utils/avisoCarrito.js";

const NOMBRE_PELIGROSO = "<img src=x onerror=alert(1)>";
const SRC = fileURLToPath(new URL("../src", import.meta.url));
const leer = (ruta) => readFileSync(join(SRC, ruta), "utf8");

// --- Qué dice el aviso ---

test("agregado: título de éxito; el nombre va aparte, tal cual (como texto)", () => {
  avisar("agregado", NOMBRE_PELIGROSO, 3);
  const aviso = leerAviso();
  assert.equal(aviso.tipo, "exito");
  assert.equal(aviso.titulo, "Agregado al carrito");
  assert.equal(aviso.nombre, NOMBRE_PELIGROSO, "el nombre no se transforma ni se interpreta");
  assert.equal(typeof aviso.nombre, "string");
});

test("si no se agregó, el aviso dice por qué (nunca 'agregado')", () => {
  assert.deepEqual(textoAviso("tope", 3), { tipo: "info", titulo: "Ya tienes las 3 unidades disponibles" });
  assert.deepEqual(textoAviso("tope", 1), { tipo: "info", titulo: "Ya tienes la única unidad disponible" });
  assert.deepEqual(textoAviso("agotado", 0), { tipo: "info", titulo: "Este producto está agotado" });
  assert.equal(textoAviso("lleno", 5).tipo, "info");
  assert.match(textoAviso("lleno", 5).titulo, /50 productos distintos/);
  assert.equal(textoAviso("otra-cosa"), null);
});

test("un nombre que no es texto no rompe el aviso", () => {
  avisar("agregado", undefined, 3);
  assert.equal(leerAviso().nombre, "");
});

test("cada aviso lleva un número nuevo, aunque repita el texto (el lector lo vuelve a anunciar)", () => {
  avisar("agregado", "Collar reflectivo", 3); // producto inventado
  const primero = leerAviso().n;
  avisar("agregado", "Collar reflectivo", 3);
  assert.equal(leerAviso().n, primero + 1);
});

test("limpiarAviso solo borra el aviso que le toca (no uno más nuevo)", () => {
  avisar("agregado", "Collar reflectivo", 3);
  const viejo = leerAviso().n;
  avisar("agregado", "Cama mediana", 3);
  limpiarAviso(viejo);
  assert.equal(leerAviso().nombre, "Cama mediana", "el reloj del aviso viejo no borra el nuevo");
  limpiarAviso(leerAviso().n);
  assert.equal(leerAviso().titulo, "");
});

test("quien escucha se entera de cada aviso y puede dejar de escuchar", () => {
  let veces = 0;
  const dejar = suscribirAviso(() => veces++);
  avisar("agregado", "Collar reflectivo", 3);
  dejar();
  avisar("agregado", "Collar reflectivo", 3);
  assert.equal(veces, 1);
});

// --- El componente y su lugar en la página ---

test("addToCartToast.js ya no existe y nadie lo importa", () => {
  assert.equal(existsSync(join(SRC, "assets/js/addToCartToast.js")), false);
  const culpables = archivosDeCodigo(SRC)
    .filter((ruta) => /addToCartToast|showAddToCartToast/.test(sinComentarios(readFileSync(ruta, "utf8"))))
    .map((ruta) => relative(SRC, ruta));
  assert.deepEqual(culpables, []);
});

test("AvisoCarrito: la zona role=\"status\" es lo PRIMERO que se pinta, sin condición", () => {
  const fuente = leer("components/AvisoCarrito.jsx");
  // El return abre directo con la caja role="status": existe antes del texto
  assert.match(fuente, /return \(\s*<div\s+role="status"/);
  // El nombre va como texto de React ({aviso.nombre}), no como HTML
  assert.match(fuente, /\{aviso\.nombre\}/);
});

test("App.jsx monta <AvisoCarrito /> siempre (no dentro de una condición)", () => {
  const linea = leer("App.jsx").split("\n").find((l) => l.includes("<AvisoCarrito"));
  assert.ok(linea, "falta <AvisoCarrito /> en App.jsx");
  assert.equal(linea.trim(), "<AvisoCarrito />");
});

test("el carrito avisa desde addItem (sabe si de verdad se agregó)", () => {
  assert.match(leer("context/CartContext.jsx"), /avisar\(r\.resultado, product\.name, r\.maximo\)/);
});

// --- Guardia: que no vuelva HTML crudo a ningún archivo de la web ---

const HTML_CRUDO = /\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|dangerouslySetInnerHTML|document\.write\(/;

function archivosDeCodigo(carpeta) {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(carpeta, e.name);
    if (e.isDirectory()) return archivosDeCodigo(ruta);
    return /\.(js|jsx)$/.test(e.name) ? [ruta] : [];
  });
}

/** Quita comentarios // y /* *\/ (la historia del aviso viejo se cuenta en comentarios). */
function sinComentarios(codigo) {
  return codigo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

test("ningún archivo de src/ escribe HTML crudo (innerHTML y parecidos)", () => {
  const culpables = archivosDeCodigo(SRC)
    .filter((ruta) => HTML_CRUDO.test(readFileSync(ruta, "utf8")))
    .map((ruta) => relative(SRC, ruta));
  assert.deepEqual(culpables, []);
});
