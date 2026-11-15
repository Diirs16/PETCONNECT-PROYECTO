// Fase 3 del rediseño (#28): un solo formato de precio (src/utils/precio.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatearPrecio } from "../src/utils/precio.js";

// Intl separa "$" y el número con un espacio especial (no separable);
// aquí se cambia por un espacio normal para comparar fácil.
const precio = (valor) => formatearPrecio(valor)?.replace(/\s/gu, " ");

test("un precio con centavos se redondea al peso, sin coma decimal", () => {
  assert.equal(precio(89900.5), "$ 89.901");
});

test("cero se muestra como $ 0", () => {
  assert.equal(precio(0), "$ 0");
});

test("el precio más alto que admite la BD (decimal 10,2) no muestra centavos", () => {
  assert.equal(precio(99999999.99), "$ 100.000.000");
});

test("el precio puede llegar como texto desde la API", () => {
  assert.equal(precio("25000.00"), "$ 25.000");
});

test("un precio que no es número no se inventa: devuelve null", () => {
  for (const valor of [null, undefined, "", "abc", NaN, Infinity]) {
    assert.equal(formatearPrecio(valor), null, `precio ${String(valor)}`);
  }
});
