// Fase 3 del rediseño (#40): el buscador del catálogo ignora tildes y mayúsculas
// (src/utils/texto.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarTexto, coincideBusqueda, resumir } from "../src/utils/texto.js";

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

// Fase 4 (§3.6): descripción de la pestaña de la ficha de producto.

test("resumir: un texto vacío, con solo espacios o que no es texto da ''", () => {
  assert.equal(resumir(""), "");
  assert.equal(resumir("   \n  "), "");
  assert.equal(resumir(null), "");
});

test("resumir: un texto corto queda igual (sin '…')", () => {
  assert.equal(resumir("Collar de nailon."), "Collar de nailon.");
});

test("resumir: los saltos de línea y espacios repetidos se vuelven un espacio", () => {
  assert.equal(resumir("Primera línea.\n\nSegunda   línea."), "Primera línea. Segunda línea.");
});

test("resumir: un texto largo se corta en un espacio, con '…' y sin pasar del máximo", () => {
  const largo = "palabra ".repeat(300); // 2.400 letras
  const corto = resumir(largo, 150);
  assert.ok(corto.length <= 150);
  assert.ok(corto.endsWith("palabra…")); // no parte una palabra
});

test("resumir: una sola palabra larguísima se corta igual", () => {
  const corto = resumir("a".repeat(500), 150);
  assert.equal(corto.length, 150);
  assert.ok(corto.endsWith("…"));
});
