import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cerrarSesionEnServidor,
  getPerfil,
  loginUser,
  registerUser,
  verifyCode as apiVerifyCode,
  verifyLoginCode as apiVerifyLoginCode,
} from "../services/api";
import { cerrarSesion, revalidarSesion } from "../utils/sesion";
import { AuthContext } from "./useAuth";

// Fase 9 del rediseño (#32): el hook useAuth vive en useAuth.js y el valor del
// contexto se memoriza (useMemo/useCallback). Antes era un objeto nuevo en cada
// render y todo lo que usa useAuth se volvía a dibujar aunque nada cambiara.
// Lo que hace cada función NO cambió: solo está envuelta en useCallback
// (que guarda la misma función mientras no cambie lo que usa).

const SESSION_KEY = "petconnect_session";
const TOKEN_KEY   = "petconnect_token";

function saveSession(userData, token) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(() => loadSession());
  const [showLogin, setShowLogin]     = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authError, setAuthError]     = useState(null);
  const [pendingEmail, setPendingEmail] = useState(null);
  const [pendingLoginEmail, setPendingLoginEmail] = useState(null);

  // Ítem 4.7 (A-24): la sesión guardada se muestra de inmediato, pero al abrir la
  // web se pregunta a la API (/auth/me) si el token sigue vigente. Solo un 401
  // la cierra; si la API no responde (503, red caída) la sesión no se toca.
  useEffect(() => {
    if (!loadSession()) return;
    let vigente = true; // React (StrictMode) puede montar dos veces: vale la última
    revalidarSesion({
      leerToken: () => localStorage.getItem(TOKEN_KEY),
      obtenerPerfil: getPerfil,
    }).then(({ accion, perfil }) => {
      if (!vigente) return;
      if (accion === "cerrar") {
        setUser(null);
        clearSession();
      } else if (accion === "actualizar") {
        setUser(perfil); // nombre y correo al día; el token guardado se conserva
        saveSession(perfil);
      }
    });
    return () => {
      vigente = false;
    };
  }, []);

  const _setUser = useCallback((userData, token) => {
    setUser(userData);
    if (userData) saveSession(userData, token);
    else clearSession();
  }, []);

  // aceptaDatos: solo true cuando la persona marcó la casilla de autorización
  // (ítem 3.5, cuentas sin autorización vigente). Si no, no se manda.
  const login = useCallback(async (email, password, aceptaDatos) => {
    setAuthError(null);
    await loginUser(email, password, aceptaDatos);
    setPendingLoginEmail(email);
  }, []);

  const verifyLoginCode = useCallback(async (email, code) => {
    setAuthError(null);
    const { token, ...userData } = await apiVerifyLoginCode(email, code);
    _setUser(userData, token);
    setPendingLoginEmail(null);
    setShowLogin(false);
  }, [_setUser]);

  const register = useCallback(async (name, email, password, aceptaDatos) => {
    setAuthError(null);
    await registerUser(name, email, password, aceptaDatos);
    setPendingEmail(email);
  }, []);

  const verifyCode = useCallback(async (email, code) => {
    setAuthError(null);
    const { token, ...userData } = await apiVerifyCode(email, code);
    _setUser(userData, token);
    setPendingEmail(null);
    setShowRegister(false);
  }, [_setUser]);

  // Solo borra la sesión de este navegador (sin llamar a la API). Se usa cuando la
  // API ya dijo que el token no vale (401), p. ej. en FormularioSolicitud.jsx.
  const cerrarSesionLocal = useCallback(() => {
    _setUser(null);
    setPendingEmail(null);
    setPendingLoginEmail(null);
  }, [_setUser]);

  // Ítem 4.13 (A-03): botón "Cerrar sesión". Cierra en la API (todos los aparatos) y
  // siempre en este navegador. Devuelve "cerrada", "ya-cerrada" o "sin-confirmar"
  // (ver utils/sesion.js); con "sin-confirmar" el Header muestra un aviso.
  const logout = useCallback(() =>
    cerrarSesion({
      leerToken: () => localStorage.getItem(TOKEN_KEY),
      cerrarEnServidor: cerrarSesionEnServidor,
      borrarLocal: cerrarSesionLocal,
    }), [cerrarSesionLocal]);

  const openLogin = useCallback(() => {
    setShowRegister(false);
    setShowLogin(true);
    setAuthError(null);
    setPendingLoginEmail(null);
  }, []);

  const openRegister = useCallback(() => {
    setShowLogin(false);
    setShowRegister(true);
    setAuthError(null);
    setPendingEmail(null);
  }, []);

  // Las funciones set… de useState nunca cambian: no hace falta ponerlas en la lista
  const valor = useMemo(
    () => ({
      user,
      showLogin,
      showRegister,
      authError,
      setAuthError,
      setShowLogin,
      setShowRegister,
      pendingEmail,
      setPendingEmail,
      pendingLoginEmail,
      setPendingLoginEmail,
      login,
      verifyLoginCode,
      register,
      verifyCode,
      logout,
      cerrarSesionLocal,
      openLogin,
      openRegister,
    }),
    [
      user,
      showLogin,
      showRegister,
      authError,
      pendingEmail,
      pendingLoginEmail,
      login,
      verifyLoginCode,
      register,
      verifyCode,
      logout,
      cerrarSesionLocal,
      openLogin,
      openRegister,
    ],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
