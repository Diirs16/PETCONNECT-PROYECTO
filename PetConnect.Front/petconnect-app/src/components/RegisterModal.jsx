import { useState, useMemo, useEffect, useRef } from "react";
import { Check, AlertCircle, Loader2, RotateCw, MailCheck } from "lucide-react";
import CasillaAutorizacion from "./CasillaAutorizacion";
import DialogoCuenta from "./DialogoCuenta";
import { useAuth } from "../context/useAuth";
import { esFormatoCorreoValido } from "../utils/validarCorreo";
// Ítem 4.1 (A-17, NC-004): las reglas de la contraseña son las mismas de la API
import { REGLAS_CONTRASENA } from "../utils/contrasena";
import { validarCorreo, resendRegisterCode } from "../services/api";

// Mismas reglas que el servidor (otp/servicio.py, ítem 2.7): 60 s entre correos
// y máximo 3 reenvíos por código. El servidor las aplica igual aunque esto se salte.
const ESPERA_REENVIO_MS = 60_000;
const MAX_REENVIOS = 3;

// NC-005 (ítem 3.1): la casilla de autorización empieza SIN marcar (Ley 1581, art. 9).
// Su texto (B.1 y B.2) vive en CasillaAutorizacion.jsx; el mensaje es el de B.3 de
// Documentacion/Legal/POLITICA-TRATAMIENTO-DATOS-v1.0-BORRADOR.md
const FORM_VACIO = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  aceptaDatos: false,
};
const MENSAJE_SIN_AUTORIZACION = "Para crear tu cuenta debes autorizar el tratamiento de tus datos personales.";

// Fase 9 del rediseño: la ventana es un <dialog> (DialogoCuenta.jsx) con dos pasos
// (datos y código). Colores de los tokens, campos de 16 px con borde borde-fuerte
// (#14, #15), autoComplete (#16), el código con su etiqueta (#9), ayudas en
// tinta-suave (#11) y spinners con motion-safe (#43). Mismas clases que LoginModal.
const ETIQUETA = "mb-1.5 block text-sm font-semibold text-tinta";
const CAMPO =
  "block w-full rounded-control border border-borde-fuerte bg-superficie px-3 py-2.5 text-tinta caret-marca placeholder:text-tinta-suave focus:outline-2 focus:outline-offset-1 focus:outline-marca aria-invalid:border-error";
const CAMPO_CODIGO = `${CAMPO} text-center text-2xl font-semibold tracking-widest tabular-nums`;
const BOTON_PRINCIPAL =
  "presionable inline-flex min-h-11 w-full items-center justify-center rounded-control bg-marca px-5 text-base font-semibold text-superficie enabled:hover:bg-marca-hover disabled:cursor-not-allowed disabled:opacity-60";
const ENLACE = "font-semibold text-marca underline underline-offset-2 hover:text-marca-hover";
const ERROR = "mb-4 rounded-control border border-error/40 bg-superficie px-3 py-2 text-base text-error";

// Color del mensaje del correo según su estado (tokens con contraste ≥ 4,5:1)
const COLOR_ESTADO_CORREO = {
  valido: "text-exito",
  verificando: "text-tinta-suave",
  sin_verificar: "text-aviso",
};

export default function RegisterModal() {
  const {
    showRegister,
    showLogin,
    setShowRegister,
    register,
    verifyCode,
    openLogin,
    authError,
    setAuthError,
    pendingEmail,
    setPendingEmail,
  } = useAuth();

  const [form, setForm] = useState(FORM_VACIO);
  const aceptaRef = useRef(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const ruleResults = useMemo(
    () => REGLAS_CONTRASENA.map((r) => ({ ...r, ok: r.test(form.password) })),
    [form.password]
  );
  const allRulesOk = ruleResults.every((r) => r.ok);

  // Estado del correo: "vacio" | "formato_invalido" | "verificando" | "valido" | "invalido" | "sin_verificar"
  const [emailStatus, setEmailStatus] = useState({ estado: "vacio", mensaje: "" });

  useEffect(() => {
    const email = form.email.trim();

    if (!email) {
      setEmailStatus({ estado: "vacio", mensaje: "" });
      return;
    }
    // 1. Formato: instantáneo, 100% en el navegador.
    if (!esFormatoCorreoValido(email)) {
      setEmailStatus({ estado: "formato_invalido", mensaje: "El formato del correo no es válido" });
      return;
    }
    // 2. Dominio: se confirma con el backend (consulta registros MX),
    //    con un pequeño retraso para no llamar la API en cada tecla.
    setEmailStatus({ estado: "verificando", mensaje: "Verificando dominio…" });
    const timeoutId = setTimeout(async () => {
      try {
        const res = await validarCorreo(email);
        setEmailStatus({ estado: res.valido ? "valido" : "invalido", mensaje: res.mensaje });
      } catch {
        setEmailStatus({ estado: "sin_verificar", mensaje: "No se pudo verificar el dominio ahora mismo" });
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [form.email]);

  const emailBloqueaEnvio = emailStatus.estado === "formato_invalido" || emailStatus.estado === "invalido";

  // --- Reenviar código (ítem 2.7) ---
  // reenviarDesde: hora (ms) a partir de la cual se puede volver a pedir el código.
  // ahora: se actualiza cada segundo solo mientras dura la espera (cuenta regresiva).
  const [reenviarDesde, setReenviarDesde] = useState(0);
  const [ahora, setAhora] = useState(0);
  const [reenvios, setReenvios] = useState(0);
  const [reenviando, setReenviando] = useState(false);
  const [avisoReenvio, setAvisoReenvio] = useState("");

  useEffect(() => {
    if (reenviarDesde <= ahora) return;
    const id = setTimeout(() => setAhora(Date.now()), 1000);
    return () => clearTimeout(id);
  }, [reenviarDesde, ahora]);

  const segundosRestantes = Math.max(0, Math.ceil((reenviarDesde - ahora) / 1000));
  const sinReenvios = reenvios >= MAX_REENVIOS;
  const reenvioBloqueado = reenviando || segundosRestantes > 0 || sinReenvios;

  const iniciarEspera = () => {
    const t = Date.now();
    setAhora(t);
    setReenviarDesde(t + ESPERA_REENVIO_MS);
  };

  const reiniciarReenvio = () => {
    setReenviarDesde(0);
    setAhora(0);
    setReenvios(0);
    setAvisoReenvio("");
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailBloqueaEnvio) {
      setAuthError(emailStatus.mensaje || "El correo no es válido");
      return;
    }
    if (!allRulesOk) {
      setAuthError("La contraseña no cumple todos los requisitos");
      setShowRules(true);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setAuthError("Las contraseñas no coinciden");
      return;
    }
    // Sin la casilla no se llama a la API (y la API lo rechazaría igual con 400)
    if (!form.aceptaDatos) {
      setAuthError(MENSAJE_SIN_AUTORIZACION);
      aceptaRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.aceptaDatos);
      setForm(FORM_VACIO);
      reiniciarReenvio();
      iniciarEspera();   // la espera arranca también con el primer código
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
      await verifyCode(pendingEmail, code);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (reenvioBloqueado) return;   // aria-disabled no bloquea el clic por sí solo
    setReenviando(true);
    setAuthError(null);
    setAvisoReenvio("");
    try {
      await resendRegisterCode(pendingEmail);
      setReenvios((n) => n + 1);
      // Aviso neutro: no confirma que el correo tenga un registro en curso
      setAvisoReenvio("Si hay un registro pendiente, te reenviamos el código. Revisa también la carpeta de spam.");
      iniciarEspera();
    } catch (err) {
      setAuthError(err.message);   // 429, 503 u otro error de la API, como en el resto del modal
    } finally {
      setReenviando(false);
    }
  };

  const handleChangeEmail = () => {
    setAuthError(null);
    setPendingEmail(null);
    setCode("");
    reiniciarReenvio();
  };

  // D9.3: al cerrar de cualquier forma (X, Escape, fondo, al crear la cuenta o al
  // pasar a Iniciar sesión) se conservan el nombre y el correo, y se olvidan las
  // contraseñas y la casilla (vuelve a empezar SIN marcar). Antes la X borraba todo.
  const alCerrar = () => {
    setShowRegister(false);
    setCode("");
    setForm((f) => ({ ...FORM_VACIO, name: f.name, email: f.email }));
    reiniciarReenvio();
  };

  const paso = pendingEmail ? "codigo" : "datos";
  const conEstadoCorreo = emailStatus.estado !== "vacio";

  return (
    <DialogoCuenta
      abierto={showRegister}
      paso={paso}
      titulo={paso === "datos" ? "Crear cuenta" : "Verificar correo"}
      idTitulo="registro-titulo"
      etiquetaCerrar="Cerrar registro"
      cambiando={showLogin}
      alCerrar={alCerrar}
    >
      {paso === "datos" ? (
        <>
          {authError && (
            <p role="alert" className={ERROR}>
              {authError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className={ETIQUETA}>
                Nombre completo
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
                data-autofoco
                className={`${CAMPO} text-base`}
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className={ETIQUETA}>
                Correo electrónico
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                aria-invalid={emailBloqueaEnvio || undefined}
                aria-describedby={conEstadoCorreo ? "reg-email-estado" : undefined}
                className={`${CAMPO} text-base`}
                placeholder="tu@correo.com"
              />
              {conEstadoCorreo && (
                <p
                  id="reg-email-estado"
                  className={`mt-1.5 flex items-start gap-1.5 text-sm break-words ${
                    COLOR_ESTADO_CORREO[emailStatus.estado] ?? "text-error"
                  }`}
                >
                  {emailStatus.estado === "verificando" ? (
                    <Loader2 className="mt-0.5 h-4 w-4 shrink-0 motion-safe:animate-spin" aria-hidden="true" />
                  ) : emailStatus.estado === "valido" ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="min-w-0">{emailStatus.mensaje}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reg-password" className={ETIQUETA}>
                Contraseña
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setShowRules(true)}
                required
                aria-describedby={showRules ? "reg-reglas" : undefined}
                className={`${CAMPO} text-base`}
                placeholder="Ej: MiPerro@2025"
              />
              {showRules && (
                <ul id="reg-reglas" className="mt-2 space-y-1">
                  {ruleResults.map((r) => (
                    <li
                      key={r.id}
                      className={`flex items-start gap-1.5 text-sm ${r.ok ? "text-exito" : "text-tinta-suave"}`}
                    >
                      {r.ok ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className={ETIQUETA}>
                Confirmar contraseña
              </label>
              <input
                id="reg-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className={`${CAMPO} text-base`}
                placeholder="Repite tu contraseña"
              />
            </div>

            {/* NC-005: autorización previa, expresa e informada (Ley 1581, arts. 9 y 12) */}
            <CasillaAutorizacion
              ref={aceptaRef}
              id="reg-acepta"
              name="aceptaDatos"
              checked={form.aceptaDatos}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading || emailBloqueaEnvio || !allRulesOk || form.password !== form.confirmPassword}
              className={BOTON_PRINCIPAL}
            >
              {loading ? "Enviando código…" : "Registrarse"}
            </button>
          </form>

          <p className="mt-5 text-sm text-tinta-suave">
            ¿Ya tienes cuenta?{" "}
            <button type="button" onClick={openLogin} className={ENLACE}>
              Inicia sesión
            </button>
          </p>
        </>
      ) : (
        <>
          <p id="reg-codigo-ayuda" className="mb-5 text-base text-tinta-suave">
            Ingresa el código de 6 dígitos que enviamos a{" "}
            <span className="font-semibold break-all text-tinta">{pendingEmail}</span>
          </p>

          {authError && (
            <p role="alert" className={ERROR}>
              {authError}
            </p>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="reg-codigo" className={ETIQUETA}>
                Código de verificación
              </label>
              <input
                id="reg-codigo"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                data-autofoco
                aria-describedby="reg-codigo-ayuda"
                className={CAMPO_CODIGO}
                placeholder="------"
              />
            </div>

            <button type="submit" disabled={loading || code.length !== 6} className={BOTON_PRINCIPAL}>
              {loading ? "Verificando…" : "Confirmar código"}
            </button>
          </form>

          <div className="mt-5 border-t border-borde pt-4">
            <p className="mb-2 text-sm text-tinta-suave">¿No recibiste el código?</p>
            <button
              type="button"
              onClick={handleResend}
              aria-disabled={reenvioBloqueado}
              className="presionable inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-borde-fuerte bg-superficie px-5 text-base font-semibold text-tinta hover:border-marca hover:text-marca aria-disabled:cursor-not-allowed aria-disabled:border-borde aria-disabled:bg-papel aria-disabled:text-tinta-suave"
            >
              <RotateCw className={`h-4 w-4 shrink-0 ${reenviando ? "motion-safe:animate-spin" : ""}`} aria-hidden="true" />
              <span className="tabular-nums">
                {reenviando
                  ? "Reenviando…"
                  : sinReenvios
                  ? "Ya no se puede reenviar más"
                  : segundosRestantes > 0
                  ? `Reenviar en ${segundosRestantes} s`
                  : "Reenviar código"}
              </span>
            </button>

            {/* Siempre en el DOM para que los lectores de pantalla anuncien el cambio */}
            <div role="status" aria-live="polite">
              {avisoReenvio && (
                <p className="mt-3 flex items-start gap-2 rounded-control border border-exito/40 bg-superficie px-3 py-2 text-sm text-exito">
                  <MailCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {avisoReenvio}
                    {sinReenvios && " Ya usaste los reenvíos de este código; si no llega, revisa que el correo esté bien escrito."}
                  </span>
                </p>
              )}
            </div>

            <p className="mt-4 text-sm text-tinta-suave">
              ¿Escribiste mal tu correo?{" "}
              <button type="button" onClick={handleChangeEmail} className={ENLACE}>
                Cambiar correo
              </button>
            </p>
          </div>
        </>
      )}
    </DialogoCuenta>
  );
}
