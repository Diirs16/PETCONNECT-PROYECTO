// Fase 9 del rediseño: las ventanas de "Iniciar sesión" y "Crear cuenta".
// Node no entiende JSX: estas pruebas leen el texto de los archivos (como
// casilla-autorizacion.test.js). Vigilan lo que pide la auditoría:
// #1 <dialog> nativo, #9 código con etiqueta y autocompletado, #16 autoComplete,
// #11/#13 sin colores escritos a mano y #43 spinners con motion-safe.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");
const DIALOGO = leer("../src/components/DialogoCuenta.jsx");
const LOGIN = leer("../src/components/LoginModal.jsx");
const REGISTRO = leer("../src/components/RegisterModal.jsx");
const CASILLA = leer("../src/components/CasillaAutorizacion.jsx");
const ARCHIVOS = { DialogoCuenta: DIALOGO, LoginModal: LOGIN, RegisterModal: REGISTRO, CasillaAutorizacion: CASILLA };

test("DialogoCuenta es un <dialog> abierto con showModal() y con título asociado", () => {
  assert.match(DIALOGO, /<dialog\b/);
  assert.match(DIALOGO, /\.showModal\(\)/);
  assert.match(DIALOGO, /aria-labelledby=\{idTitulo\}/);
  assert.match(DIALOGO, /onCancel=\{/, "Escape debe pasar por onCancel");
  assert.match(DIALOGO, /onClose=\{/, "la limpieza debe estar en close");
});

test("el inicio de sesión y el registro usan DialogoCuenta", () => {
  for (const [nombre, texto] of [["LoginModal", LOGIN], ["RegisterModal", REGISTRO]]) {
    assert.match(texto, /<DialogoCuenta\b/, `${nombre} no usa <DialogoCuenta>`);
    assert.doesNotMatch(texto, /fixed inset-0/, `${nombre} todavía dibuja un modal a mano`);
  }
});

test("el campo del código tiene etiqueta visible y se autocompleta en el celular (#9)", () => {
  for (const [nombre, texto] of [["LoginModal", LOGIN], ["RegisterModal", REGISTRO]]) {
    assert.match(texto, />\s*Código de verificación\s*</, `${nombre}: falta la etiqueta`);
    assert.match(texto, /autoComplete="one-time-code"/, `${nombre}: falta one-time-code`);
    assert.match(texto, /inputMode="numeric"/, `${nombre}: falta el teclado numérico`);
  }
});

test("los campos dicen qué son al gestor de contraseñas (#16)", () => {
  assert.match(LOGIN, /autoComplete="email"/);
  assert.match(LOGIN, /autoComplete="current-password"/);
  assert.match(REGISTRO, /autoComplete="name"/);
  assert.match(REGISTRO, /autoComplete="email"/);
  assert.equal(REGISTRO.match(/autoComplete="new-password"/g)?.length, 2, "contraseña y confirmación");
});

test("sin colores escritos a mano ni clases viejas en los archivos de cuenta", () => {
  for (const [nombre, texto] of Object.entries(ARCHIVOS)) {
    assert.doesNotMatch(texto, /#[0-9a-fA-F]{3,8}\b/, `${nombre}: color hex`);
    assert.doesNotMatch(
      texto,
      /\b(?:text|bg|border|accent|outline|ring|from|to|via)-(?:gray|red|green|amber)-\d|\b(?:text|bg|border|accent|outline)-(?:black|white)\b/,
      `${nombre}: color de Tailwind fuera de los tokens`,
    );
    assert.doesNotMatch(texto, /btn-hover|btn-ripple|modal-enter|backdrop-fade/, `${nombre}: clase vieja`);
  }
});

test("los spinners respetan 'reducir movimiento' (#43)", () => {
  assert.doesNotMatch(REGISTRO, /(?<!motion-safe:)animate-spin/);
});

test("nada de la cuenta se escribe en la consola", () => {
  for (const [nombre, texto] of Object.entries(ARCHIVOS)) {
    assert.doesNotMatch(texto, /console\./, `${nombre} usa console`);
  }
});
