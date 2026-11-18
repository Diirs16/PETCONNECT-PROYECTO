// Ítem 3.4 (A-22): formato de los datos de una mascota (src/utils/mascota.js).
// Lo que no se sabe no se muestra: la función devuelve null o lo salta.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatearEdad, formatearSexo, rasgosMascota } from "../src/utils/mascota.js";

// Fase 7 del rediseño: los mismos datos, pero como lista (etiquetas de la tarjeta).
test("los rasgos salen como lista, solo con lo que se conoce", () => {
  assert.deepEqual(rasgosMascota({ breed: " Criollo ", age: 2, gender: "hembra" }), [
    "Criollo",
    "2 años",
    "Hembra",
  ]);
  assert.deepEqual(rasgosMascota({ breed: null, age: 0, gender: "no_definido" }), ["Menos de 1 año"]);
  assert.deepEqual(rasgosMascota({ breed: "", age: 25, gender: "macho" }), ["25 años", "Macho"]);
});

test("sin ningún rasgo conocido la lista queda vacía (no hay renglón vacío)", () => {
  assert.deepEqual(rasgosMascota({ breed: "  ", age: null, gender: "no_definido" }), []);
  assert.deepEqual(rasgosMascota({}), []);
  assert.deepEqual(rasgosMascota(null), []);
});

test("los rasgos no incluyen la especie, tamaño, vacunación ni esterilización", () => {
  assert.deepEqual(
    rasgosMascota({ breed: "Mestizo", age: 4, gender: "macho", species: "Perro", size: "Grande", vaccinated: true }),
    ["Mestizo", "4 años", "Macho"],
  );
});

test("la edad se escribe en años y 0 es 'Menos de 1 año'", () => {
  assert.equal(formatearEdad(0), "Menos de 1 año");
  assert.equal(formatearEdad(1), "1 año");
  assert.equal(formatearEdad(2), "2 años");
  assert.equal(formatearEdad(12), "12 años");
});

test("una edad desconocida o inválida no se muestra", () => {
  for (const valor of [null, undefined, -1, 1.5, "2", NaN]) {
    assert.equal(formatearEdad(valor), null, `edad ${String(valor)}`);
  }
});

test("el sexo empieza en mayúscula y 'no_definido' no se muestra", () => {
  assert.equal(formatearSexo("hembra"), "Hembra");
  assert.equal(formatearSexo("macho"), "Macho");
  for (const valor of ["no_definido", "", null, undefined, "otro"]) {
    assert.equal(formatearSexo(valor), null, `sexo ${String(valor)}`);
  }
});

// Fase 12 (D12.7): se borraron las dos pruebas de datosMascota junto con la función.
// Que no salgan tamaño, vacunación ni esterilización lo sigue vigilando la prueba
// "los rasgos no incluyen la especie, tamaño, vacunación ni esterilización".
