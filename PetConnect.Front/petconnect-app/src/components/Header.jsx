import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  House,
  Mail,
  Menu,
  PawPrint,
  ShoppingCart,
  Store,
  User,
  X,
} from "lucide-react";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";

// Cada enlace lleva ícono y texto (RIU03 y RNF02: nada escondido detrás de un
// ícono solo). Solo se listan secciones que ya existen.
const navLinks = [
  { to: "/", label: "Inicio", Icono: House },
  { to: "/catalogo", label: "Catálogo", Icono: Store },
  { to: "/adopcion", label: "Adopción", Icono: PawPrint },
  { to: "/contacto", label: "Contacto", Icono: Mail },
];

// Mayúscula al inicio de cada palabra. Antes se usaba /\b\w/g, y como \w no
// reconoce letras con tilde, "maría josé" salía "MaríA JosÉ" (#7).
// Si el nombre llega vacío o sin definir, devuelve "" y no rompe la página.
function nombreBonito(nombre) {
  return (nombre ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toLocaleUpperCase("es") + palabra.slice(1))
    .join(" ");
}

// Más de 99 no cabe en el círculo del contador (#29).
const textoContador = (n) => (n > 99 ? "99+" : String(n));

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  // Fase 5 (§3.4 #3): el contador da un pulso cuando cambia la cantidad (une el
  // clic en "Agregar" con el carrito). Al cargar la página no pulsa: solo se
  // cuenta un pulso cuando el número es distinto al anterior. Guardar el valor
  // anterior en el estado durante el render es el patrón que recomienda React.
  const [totalAnterior, setTotalAnterior] = useState(totalItems);
  const [pulsos, setPulsos] = useState(0);
  if (totalItems !== totalAnterior) {
    setTotalAnterior(totalItems);
    setPulsos((n) => n + 1);
  }
  const { user, logout, openLogin } = useAuth();
  const location = useLocation();
  // Ítem 4.13 (A-03): mientras la API responde, el botón queda desactivado
  // (decisión B1) y, si no pudo confirmar el cierre, se avisa (decisión A1).
  const [cerrando, setCerrando] = useState(false);
  const [avisoCierre, setAvisoCierre] = useState(false);

  const nombre = nombreBonito(user?.name) || "Mi cuenta";

  async function salir() {
    if (cerrando) return;
    setCerrando(true);
    try {
      const resultado = await logout();
      setAvisoCierre(resultado === "sin-confirmar");
    } finally {
      setCerrando(false);
      setMenuOpen(false);
    }
  }

  const isActive = (path) => location.pathname === path;

  const etiquetaCarrito =
    totalItems > 0
      ? `Ver carrito, ${totalItems} ${totalItems === 1 ? "producto" : "productos"}`
      : "Ver carrito";

  return (
    <header className="sticky top-0 z-50 border-b border-borde bg-superficie">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        <Link
          to="/"
          aria-label="Pet Connect, ir al inicio"
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-control no-underline"
        >
          {/* Un poco más pequeño en celulares angostos: a 320 px no cabía */}
          <img src="/logo.svg" alt="" className="h-8 w-8 sm:h-9 sm:w-9" />
          <span className="font-display text-lg leading-none sm:text-xl">
            <span className="text-marca">Pet </span>
            <span className="text-acento">Connect</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ to, label, Icono }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to) ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium no-underline transition-colors ${
                isActive(to)
                  ? "bg-marca-claro text-marca"
                  : "text-tinta-suave hover:bg-papel hover:text-tinta"
              }`}
            >
              <Icono className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="presionable relative inline-flex h-11 w-11 items-center justify-center rounded-full text-tinta hover:bg-marca-claro hover:text-marca"
            aria-label={etiquetaCarrito}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {totalItems > 0 && (
              <span
                key={pulsos} // un número nuevo vuelve a montar el contador y repite el pulso
                aria-hidden="true"
                className={`absolute right-0 top-0 h-5 min-w-5 rounded-full bg-acento px-1 text-center text-xs font-semibold leading-5 tabular-nums text-superficie ${pulsos > 0 ? "contador-pulso" : ""}`}
              >
                {textoContador(totalItems)}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden items-center gap-1 lg:flex">
              <span
                className="flex max-w-40 items-center gap-1.5 px-2 text-sm text-tinta-suave"
                title={nombre}
              >
                <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{nombre}</span>
              </span>
              <button
                id="cuenta-salir"
                type="button"
                onClick={salir}
                disabled={cerrando}
                className="min-h-11 rounded-full px-3 text-sm font-medium text-tinta-suave transition-colors hover:bg-papel hover:text-tinta disabled:cursor-wait"
              >
                {cerrando ? "Cerrando sesión…" : "Salir"}
              </button>
            </div>
          ) : (
            // Fase 9 (D9.3): al entrar este botón cambia por "Salir"; el foco va ahí
            <button
              type="button"
              onClick={openLogin}
              data-foco-respaldo="cuenta-salir"
              className="presionable hidden min-h-11 items-center gap-2 rounded-full border border-borde-fuerte px-4 text-sm font-medium text-tinta hover:border-marca hover:text-marca lg:inline-flex"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              Iniciar sesión
            </button>
          )}

          <button
            id="boton-menu"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            className="presionable inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-tinta hover:bg-papel lg:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
            {menuOpen ? "Cerrar" : "Menú"}
          </button>
        </div>
      </div>

      {/* El menú existe siempre (oculto con "hidden") para que aria-controls
          apunte a algo real. Sin animación de entrada (§3.4). */}
      <div
        id="menu-movil"
        hidden={!menuOpen}
        className="border-t border-borde bg-superficie lg:hidden"
      >
        <nav aria-label="Principal" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 md:px-6">
          {navLinks.map(({ to, label, Icono }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(to) ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-control px-3 text-base font-medium no-underline ${
                isActive(to)
                  ? "bg-marca-claro text-marca"
                  : "text-tinta hover:bg-papel"
              }`}
            >
              <Icono className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          ))}

          <div className="mt-2 border-t border-borde pt-3">
            {user ? (
              <button
                type="button"
                onClick={salir}
                disabled={cerrando}
                className="flex min-h-12 w-full items-center gap-3 rounded-control px-3 text-left text-base font-medium text-tinta hover:bg-papel disabled:cursor-wait"
              >
                <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                {cerrando ? (
                  "Cerrando sesión…"
                ) : (
                  <span className="min-w-0">
                    Cerrar sesión{" "}
                    <span className="break-words font-normal text-tinta-suave">({nombre})</span>
                  </span>
                )}
              </button>
            ) : (
              // Fase 9 (D9.3): el menú se cierra al abrir la ventana; el foco vuelve a "Menú"
              <button
                type="button"
                onClick={() => {
                  openLogin();
                  setMenuOpen(false);
                }}
                data-foco-respaldo="boton-menu"
                className="flex min-h-12 w-full items-center gap-3 rounded-control px-3 text-left text-base font-medium text-tinta hover:bg-papel"
              >
                <User className="h-5 w-5" aria-hidden="true" />
                Iniciar sesión
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Aviso del ítem 4.13: la zona role="status" existe siempre para que los
          lectores de pantalla lean el mensaje cuando aparece. Se oculta solo con la
          X o al volver a iniciar sesión. */}
      <div
        role="status"
        className="pointer-events-none fixed inset-x-4 top-20 z-[60] flex justify-end sm:left-auto sm:right-5"
      >
        {avisoCierre && !user && (
          <div className="toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-control bg-noche px-4 py-3 text-sm text-papel shadow-elevada">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-aviso-claro" aria-hidden="true" />
            <p className="flex-1">
              Cerraste sesión en este navegador, pero no pudimos confirmarlo con el
              servidor. Si usas PetConnect en otro aparato, cierra sesión también allí.
            </p>
            <button
              type="button"
              onClick={() => setAvisoCierre(false)}
              className="-my-2.5 -mr-2.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-papel/10 focus-visible:outline-papel"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
