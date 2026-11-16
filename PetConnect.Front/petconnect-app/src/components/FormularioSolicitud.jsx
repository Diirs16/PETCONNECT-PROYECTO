import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { enviarMensajeContacto, enviarSolicitudAdopcion } from "../services/api";
import { MENSAJE_MAX, MENSAJE_MIN, validarMensaje, validarTelefono } from "../utils/solicitud";
import { CORREO_ATENCION } from "../utils/contacto";

// Fase 8 del rediseño: colores de los tokens (index.css), sin cambiar la lógica
// ni los textos. Campos de 16 px con borde borde-fuerte (3,8:1, #15) y foco de
// 2 px turquesa. El botón principal es terracota en adopción (como "Solicitar
// adopción") y turquesa en contacto (D8.5). Al enviar no cambia de color: se
// desactiva, muestra "Enviando…" y el cursor de espera.
const CAMPO =
  "w-full rounded-control border border-borde-fuerte bg-superficie px-3 py-2.5 text-base text-tinta focus:outline-2 focus:outline-offset-1 focus:outline-marca aria-invalid:border-error";
const BOTON_BASE =
  "presionable inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 text-base font-semibold text-superficie disabled:cursor-wait";
const COLOR_PRINCIPAL = {
  adopcion: "bg-acento enabled:hover:bg-acento-oscuro",
  contacto: "bg-marca enabled:hover:bg-marca-hover",
};
const BOTON_SECUNDARIO =
  "presionable inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-borde-fuerte bg-superficie px-5 text-base font-semibold text-tinta enabled:hover:border-marca enabled:hover:text-marca disabled:cursor-wait disabled:opacity-60";

/**
 * Formulario real de solicitud de adopción o de mensaje de contacto (ítem 3.6, A-21).
 * Decisiones del dueño (07/11/2026): solo con sesión (el nombre y el correo salen de la
 * cuenta y no se piden), teléfono opcional solo en adopción y SIN casilla aparte: el
 * aviso B.5 informa la finalidad y vale la autorización de la cuenta con la política 1.1.
 * Dice "enviada" solo cuando la API respondió 201.
 *
 * Props: tipo ("adopcion" | "contacto"), mascota ({ id, name }, solo adopción),
 * onCerrar (opcional: muestra el botón "Cerrar") y enfocarAlAbrir (opcional, D8.4:
 * al aparecer, el foco va al título del formulario o, sin sesión, a "Inicia sesión
 * para enviar"; lo usa la ficha de mascota, donde el formulario se abre con un botón).
 */
export default function FormularioSolicitud({ tipo, mascota, onCerrar, enfocarAlAbrir = false }) {
  const { user, cerrarSesionLocal, openLogin, openRegister } = useAuth();
  const esAdopcion = tipo === "adopcion";
  const id = (campo) => `${tipo}-${campo}`;
  const BOTON_PRINCIPAL = `${BOTON_BASE} ${COLOR_PRINCIPAL[tipo] ?? COLOR_PRINCIPAL.contacto}`;

  // Lo escrito se conserva aunque haya que volver a iniciar sesión.
  const [mensaje, setMensaje] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estado, setEstado] = useState("editando"); // "editando" | "enviando" | "enviada"
  const [error, setError] = useState("");
  const [campoConError, setCampoConError] = useState(null); // "mensaje" | "telefono" | null
  const [volverAEntrar, setVolverAEntrar] = useState(false); // 401 o 403 de autorización
  const [numero, setNumero] = useState(null);

  const mensajeRef = useRef(null);
  const telefonoRef = useRef(null);
  const enviadaRef = useRef(null);
  const errorRef = useRef(null);
  const tituloRef = useRef(null);
  const iniciarSesionRef = useRef(null);
  const [enfocarError, setEnfocarError] = useState(0); // al sumar 1, el foco va al error de la API

  // D8.4: al aparecer, el foco va al formulario. Así quien usa teclado o lector
  // de pantalla no tiene que buscar dónde quedó. Corre una sola vez: la ficha
  // pasa enfocarAlAbrir fijo y no cambia mientras el formulario está abierto.
  useEffect(() => {
    if (enfocarAlAbrir) (tituloRef.current ?? iniciarSesionRef.current)?.focus();
  }, [enfocarAlAbrir]);

  useEffect(() => {
    if (estado === "enviada") enviadaRef.current?.focus();
  }, [estado]);

  // Si la API rechaza el envío, el aviso puede quedar fuera de la pantalla del celular
  useEffect(() => {
    if (enfocarError) errorRef.current?.focus();
  }, [enfocarError]);

  async function enviar(e) {
    e.preventDefault();
    if (estado === "enviando") return;
    setError("");
    setVolverAEntrar(false);

    // Primero en el navegador: así no se llama a la API con algo que va a rechazar.
    const errorMensaje = validarMensaje(mensaje);
    const errorTelefono = esAdopcion ? validarTelefono(telefono) : null;
    if (errorMensaje || errorTelefono) {
      setError(errorMensaje || errorTelefono);
      setCampoConError(errorMensaje ? "mensaje" : "telefono");
      (errorMensaje ? mensajeRef : telefonoRef).current?.focus();
      return;
    }
    setCampoConError(null);

    setEstado("enviando");
    try {
      const respuesta = esAdopcion
        ? await enviarSolicitudAdopcion(mascota.id, mensaje.trim(), telefono.trim())
        : await enviarMensajeContacto(mensaje.trim());
      setNumero(respuesta?.id ?? null);
      setEstado("enviada");
    } catch (err) {
      setEstado("editando");
      if (err.status === 401) {
        setError("Tu sesión venció. Vuelve a iniciar sesión para enviar: lo que escribiste no se pierde.");
        setVolverAEntrar(true);
      } else if (err.requiereAutorizacion) {
        setError(err.message);
        setVolverAEntrar(true);
      } else {
        setError(err.message || "No pudimos enviar. Inténtalo de nuevo en unos minutos.");
      }
      setEnfocarError((n) => n + 1);
    }
  }

  function volverAIniciarSesion() {
    setError("");
    setVolverAEntrar(false);
    // Ítem 4.13: la API ya respondió 401 (el token no vale), así que no se le pide
    // cerrar la sesión: solo se borra la de este navegador.
    cerrarSesionLocal();
    openLogin();
  }

  // --- Sin sesión: no se muestra el formulario (no se recoge nada sin cuenta) ---
  if (!user) {
    return (
      <div className="space-y-4 rounded-tarjeta border border-borde bg-superficie p-4 md:p-5">
        <p className="break-words text-base text-tinta">
          {esAdopcion
            ? `Para enviar una solicitud de adopción de ${mascota.name} necesitas iniciar sesión.`
            : "Para enviarnos un mensaje desde aquí necesitas iniciar sesión."}{" "}
          Usaremos el nombre y el correo de tu cuenta.
        </p>
        <div className="flex flex-wrap gap-3">
          <button ref={iniciarSesionRef} type="button" onClick={openLogin} className={BOTON_PRINCIPAL}>
            Inicia sesión para enviar
          </button>
          <button type="button" onClick={openRegister} className={BOTON_SECUNDARIO}>
            Crear cuenta
          </button>
          {onCerrar && (
            <button type="button" onClick={onCerrar} className={BOTON_SECUNDARIO}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Enviada: solo llega aquí si la API respondió 201 ---
  if (estado === "enviada") {
    return (
      <div role="status" className="space-y-3 rounded-tarjeta border border-exito/40 bg-superficie p-4 text-tinta md:p-5">
        <h3 ref={enviadaRef} tabIndex={-1} className="flex items-center gap-2 text-lg font-semibold outline-none">
          {/* §3.4 #5: celebración solo en adopción (animations.css; respeta "reducir movimiento") */}
          <CheckCircle
            className={`h-6 w-6 shrink-0 text-exito ${esAdopcion ? "celebracion-icono" : ""}`}
            aria-hidden="true"
          />
          <span className={esAdopcion ? "celebracion-texto" : undefined}>
            {esAdopcion ? "Solicitud enviada" : "Mensaje enviado"}
          </span>
        </h3>
        <p className={`text-base ${esAdopcion ? "celebracion-texto" : ""}`}>
          {esAdopcion ? "Tu solicitud quedó guardada" : "Tu mensaje quedó guardado"}
          {numero ? ` con el número ${numero}` : ""}. El equipo de PetConnect{" "}
          {esAdopcion ? "la" : "lo"} revisará y te escribirá al correo de tu cuenta (
          <span className="break-all">{user.email}</span>).
        </p>
        {onCerrar && (
          <button type="button" onClick={onCerrar} className={BOTON_SECUNDARIO}>
            Cerrar
          </button>
        )}
      </div>
    );
  }

  const enviando = estado === "enviando";
  const largo = mensaje.trim().length;

  return (
    <form onSubmit={enviar} noValidate className="space-y-4 rounded-tarjeta border border-borde bg-superficie p-4 md:p-5">
      {/* tabIndex -1: recibe el foco al abrir (D8.4), pero no es un control (sin contorno) */}
      <h3 ref={tituloRef} tabIndex={-1} className="break-words text-lg font-semibold text-tinta outline-none">
        {esAdopcion ? `Solicitud de adopción de ${mascota.name}` : "Escríbenos"}
      </h3>

      <p className="break-words text-sm text-tinta-suave">
        Envías como <strong className="font-semibold text-tinta">{user.name}</strong> (<span className="break-all">{user.email}</span>).
      </p>

      {esAdopcion && (
        <div>
          <label htmlFor={id("telefono")} className="mb-1 block text-sm font-semibold text-tinta">
            Teléfono <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <input
            ref={telefonoRef}
            id={id("telefono")}
            name="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            aria-invalid={campoConError === "telefono" || undefined}
            aria-describedby={campoConError === "telefono" ? id("error") : undefined}
            className={CAMPO}
          />
        </div>
      )}

      <div>
        <label htmlFor={id("mensaje")} className="mb-1 block break-words text-sm font-semibold text-tinta">
          {esAdopcion ? `¿Por qué quieres adoptar a ${mascota.name}?` : "Mensaje"}
        </label>
        <textarea
          ref={mensajeRef}
          id={id("mensaje")}
          name="mensaje"
          rows={5}
          required
          maxLength={MENSAJE_MAX}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          aria-invalid={campoConError === "mensaje" || undefined}
          aria-describedby={`${id("ayuda")}${campoConError === "mensaje" ? ` ${id("error")}` : ""}`}
          className={`${CAMPO} resize-y`}
        />
        <p id={id("ayuda")} className="mt-1 flex justify-between gap-3 text-xs text-tinta-suave">
          <span>
            Entre {MENSAJE_MIN} y {MENSAJE_MAX} caracteres.
          </span>
          <span className="tabular-nums" aria-hidden="true">
            {largo}/{MENSAJE_MAX}
          </span>
        </p>
      </div>

      {/* Aviso B.5 del borrador de la política (versión 1.1): informa la finalidad (Ley 1581, art. 12) */}
      <p id={id("aviso")} className="break-words text-xs leading-relaxed text-tinta-suave">
        Al enviar, usaremos tu nombre, tu correo
        {esAdopcion ? ", tu teléfono (si lo escribes)" : ""} y este mensaje para{" "}
        {esAdopcion ? `gestionar tu solicitud de adopción de ${mascota.name}` : "responder tu consulta"}, según la{" "}
        <Link
          to="/politica-de-datos"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-marca underline underline-offset-2 hover:text-marca-hover"
        >
          Política de tratamiento de datos personales
        </Link>
        . Solo el equipo de PetConnect lee tu mensaje. No escribas datos sensibles (salud, creencias…). Puedes
        pedir que lo borremos escribiendo a{" "}
        <a href={`mailto:${CORREO_ATENCION}`} className="break-all font-medium text-marca underline underline-offset-2 hover:text-marca-hover">
          {CORREO_ATENCION}
        </a>
        .
      </p>

      {error && (
        <div
          ref={errorRef}
          id={id("error")}
          role="alert"
          tabIndex={-1}
          className="space-y-3 rounded-control border border-error/40 bg-superficie p-3 text-base text-error focus:outline-2 focus:outline-offset-2 focus:outline-error"
        >
          <p>{error}</p>
          {volverAEntrar && (
            <button type="button" onClick={volverAIniciarSesion} className={BOTON_SECUNDARIO}>
              Volver a iniciar sesión
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={enviando} aria-describedby={id("aviso")} className={`${BOTON_PRINCIPAL} flex-1 whitespace-nowrap`}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {enviando ? "Enviando…" : esAdopcion ? "Enviar solicitud" : "Enviar mensaje"}
        </button>
        {onCerrar && (
          <button type="button" onClick={onCerrar} disabled={enviando} className={BOTON_SECUNDARIO}>
            Cerrar
          </button>
        )}
      </div>
    </form>
  );
}
