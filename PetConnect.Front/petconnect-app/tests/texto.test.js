// Fase 3 del rediseño (#40): el buscador del catálogo ignora tildes y mayúsculas
// (src/utils/texto.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarTexto, coincideBusqueda } from "../src/utils/texto.js";

test("'algodon' encuentra 'Algodón'", () => {
  assert.equal(coincideBusqueda("Cama de Algodón para perro", "algodon"), true);
});

test("también al revés: buscar con tilde encuentra sin tilde", () => {
  assert.equal(coincideBusqueda("Juguete de algodon", "ALGODÓN"), true);
});

test("la ñ se compara como n", () => {
  assert.equal(coincideBusqueda("Arnés pequeño", "pequeno"), true);
  assert.equal(normalizarTexto("Ñandú"), "nandu");
});

test("una búsqueda vacía o con solo espacios muestra todo", () => {
  assert.equal(coincideBusqueda("Collar", ""), true);
  assert.equal(coincideBusqueda("Collar", "   "), true);
});

test("lo que no coincide no aparece", () => {
  assert.equal(coincideBusqueda("Collar", "arena"), false);
});

test("un nombre que no es texto no rompe la búsqueda", () => {
  assert.equal(coincideBusqueda(null, "collar"), false);
  assert.equal(normalizarTexto(undefined), "");
});
