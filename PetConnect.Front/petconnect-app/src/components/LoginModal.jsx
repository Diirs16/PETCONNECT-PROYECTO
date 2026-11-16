import { useState, useRef } from "react";
import { useAuth } from "../context/useAuth";
import CasillaAutorizacion from "./CasillaAutorizacion";
import DialogoCuenta from "./DialogoCuenta";
import { CORREO_ATENCION } from "../utils/contacto";

// Ítem 3.5 (A-20, R05): las cuentas sin autorización vigente (creadas antes del 3.1
// o que aceptaron otra versión de la política) deben marcar la casilla para entrar.
// Textos de B.3 en Documentacion/Legal/POLITICA-TRATAMIENTO-DATOS-v1.0-BORRADOR.md.
const MENSAJE_SIN_AUTORIZACION = "Para continuar debes autorizar el tratamiento de tus datos personales.";

// Fase 9 del rediseño: la ventana es un <dialog> (DialogoCuenta.jsx) con tres pasos
// (entrar, código y autorización). Colores de los tokens (index.css), campos de
// 16 px con borde borde-fuerte (#14, #15), autoComplete (#16) y el código con su
// etiqueta (#9). La lógica y los mensajes no cambian. Mismas clases en RegisterModal.
const ETIQUETA = "mb-1.5 block text-sm font-semibold text-tinta";
const CAMPO =
  "block w-full rounded-control border border-borde-fuerte bg-superficie px-3 py-2.5 text-tinta caret-marca placeholder:text-tinta-suave focus:outline-2 focus:outline-offset-1 focus:outline-marca";
const CAMPO_CODIGO = `${CAMPO} text-center text-2xl font-semibold tracking-widest tabular-nums`;
const BOTON_PRINCIPAL =
  "presionable inline-flex min-h-11 w-full items-center justify-center rounded-control bg-marca px-5 text-base font-semibold text-superficie enabled:hover:bg-marca-hover disabled:cursor-not-allowed disabled:opacity-60";
const BOTON_SECUNDARIO =
  "presionable inline-flex min-h-11 w-full items-center justify-center rounded-control border border-borde-fuerte bg-superficie px-5 text-base font-semibold text-tinta enabled:hover:border-marca enabled:hover:text-marca disabled:cursor-not-allowed disabled:opacity-60";
const ENLACE = "font-semibold text-marca underline underline-offset-2 hover:text-marca-hover";
const ERROR = "mb-4 rounded-control border border-error/40 bg-superficie px-3 py-2 text-base text-error";

const TITULOS = {
  entrar: "Iniciar sesión",
  codigo: "Verificar inicio de sesión",
  autorizacion: "Autoriza el uso de tus datos",
};

export default function LoginModal() {
  const {
    showLogin,
    showRegister,
    setShowLogin,
    login,
    verifyLoginCode,
    pendingLoginEmail,
    setPendingLoginEmail,
    openRegister,
    authError,
    setAuthError,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  // Ítem 3.5: avisoAutorizacion guarda el mensaje del 403 de la API; si no está
  // vacío, el modal muestra el paso "Autoriza el uso de tus datos".
  const [avisoAutorizacion, setAvisoAutorizacion] = useState("");
  const [aceptaDatos, setAceptaDatos] = useState(false);   // empieza SIN marcar
  const aceptaRef = useRef(null);

  // Mismo orden de antes: primero el código, después la autorización
  const paso = pendingLoginEmail ? "codigo" : avisoAutorizacion ? "autorizacion" : "entrar";

  // La API pidió la autorización: se muestra la casilla sin marcar. El correo y
  // la contraseña siguen en el estado para repetir el inicio de sesión con ella.
  const pedirAutorizacion = (err) => {
    setAuthError(null);
    setAceptaDatos(false);
    setAvisoAutorizacion(err.message);
  };

  // Salir del paso de la casilla sin autorizar: se olvida la contraseña escrita.
  const salirDeAutorizacion = () => {
    setAuthError(null);
    setAceptaDatos(false);
    setAvisoAutorizacion("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err.requiereAutorizacion) pedirAutorizacion(err);
      else setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutorizar = async (e) => {
    e.preventDefault();
    // Sin la casilla no se llama a la API (y la API respondería 403 igual)
    if (!aceptaDatos) {
      setAuthError(MENSAJE_SIN_AUTORIZACION);
      aceptaRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      await login(email, password, true);
      // La autorización se guarda solo cuando el código sea correcto (/login/verify)
      setAvisoAutorizacion("");
      setAceptaDatos(false);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyLoginCode(pendingLoginEmail, code);
      setEmail("");
      setPassword("");
      setCode("");
    } catch (err) {
      // La versión de la política pudo cambiar mientras llegaba el código:
      // la API vuelve a pedir la casilla y no entrega el token.
      if (err.requiereAutorizacion) {
        setPendingLoginEmail(null);
        setCode("");
        pedirAutorizacion(err);
      } else {
        setAuthError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // D9.3: al cerrar de cualquier forma (X, Escape, fondo, al entrar o al pasar a
  // Crear cuenta) se conserva el correo y se olvidan la contraseña, el código y
  // el paso de autorización.
  const alCerrar = () => {
    setShowLogin(false);
    setPendingLoginEmail(null);
    setCode("");
    setPassword("");
    setAvisoAutorizacion("");
    setAceptaDatos(false);
  };

  return (
    <DialogoCuenta
      abierto={showLogin}
      paso={paso}
      titulo={TITULOS[paso]}
      idTitulo="login-titulo"
      enfocarTitulo={paso === "autorizacion"}
      etiquetaCerrar="Cerrar inicio de sesión"
      cambiando={showRegister}
      alCerrar={alCerrar}
    >
      {paso === "codigo" && (
        <>
          <p id="login-codigo-ayuda" className="mb-5 text-base text-tinta-suave">
            Ingresa el código de 6 dígitos que enviamos a{" "}
            <span className="font-semibold break-all text-tinta">{pendingLoginEmail}</span>
          </p>

          {authError && (
            <p role="alert" className={ERROR}>
              {authError}
            </p>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="login-codigo" className={ETIQUETA}>
                Código de verificación
              </label>
              <input
                id="login-codigo"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                data-autofoco
                aria-describedby="login-codigo-ayuda"
                className={CAMPO_CODIGO}
                placeholder="------"
              />
            </div>

            <button type="submit" disabled={loading || code.length !== 6} className={BOTON_PRINCIPAL}>
              {loading ? "Verificando…" : "Confirmar código"}
            </button>
          </form>

          <p className="mt-5 text-sm text-tinta-suave">
            ¿No recibiste el código?{" "}
            <button
              type="button"
              onClick={() => { setAuthError(null); setPendingLoginEmail(null); setCode(""); }}
              className={ENLACE}
            >
              Volver e intentar de nuevo
            </button>
          </p>
        </>
      )}

      {paso === "autorizacion" && (
        <>
          {/* Mensaje del 403 de la API (B.3) */}
          <p className="mb-5 text-base text-tinta-suave">{avisoAutorizacion}</p>

          {authError && (
            <p role="alert" className={ERROR}>
              {authError}
            </p>
          )}

          <form onSubmit={handleAutorizar} className="space-y-4">
            <CasillaAutorizacion
              ref={aceptaRef}
              id="login-acepta"
              name="aceptaDatos"
              checked={aceptaDatos}
              onChange={(e) => setAceptaDatos(e.target.checked)}
            />

            <button type="submit" disabled={loading} className={BOTON_PRINCIPAL}>
              {loading ? "Enviando código…" : "Autorizar y continuar"}
            </button>
            {/* Desactivado mientras se envía: si se cancelara a mitad de la petición,
                al llegar la respuesta igual saldría la pantalla del código. */}
            <button type="button" onClick={salirDeAutorizacion} disabled={loading} className={BOTON_SECUNDARIO}>
              Cancelar
            </button>
          </form>

          {/* B.3: si no autoriza, puede pedir que se borre su cuenta (proceso manual, C.8) */}
          <p className="mt-5 border-t border-borde pt-4 text-sm leading-relaxed text-tinta-suave">
            Si no quieres autorizarlo, escríbenos a{" "}
            <a href={`mailto:${CORREO_ATENCION}`} className={`${ENLACE} break-all`}>
              {CORREO_ATENCION}
            </a>{" "}
            y borraremos tu cuenta.
          </p>
        </>
      )}

      {paso === "entrar" && (
        <>
          {authError && (
            <p role="alert" className={ERROR}>
              {authError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className={ETIQUETA}>
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-autofoco
                className={`${CAMPO} text-base`}
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className={ETIQUETA}>
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${CAMPO} text-base`}
                placeholder="Tu contraseña"
              />
            </div>

            <button type="submit" disabled={loading} className={BOTON_PRINCIPAL}>
              {loading ? "Iniciando sesión…" : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-5 text-sm text-tinta-suave">
            ¿No tienes cuenta?{" "}
            <button type="button" onClick={openRegister} className={ENLACE}>
              Regístrate
            </button>
          </p>
        </>
      )}
    </DialogoCuenta>
  );
}
