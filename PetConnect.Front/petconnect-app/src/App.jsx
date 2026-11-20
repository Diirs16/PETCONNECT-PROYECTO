import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartModal from "./components/CartModal";
import AvisoCarrito from "./components/AvisoCarrito";
import LoginModal from "./components/LoginModal";
import EstadoCarga from "./components/EstadoCarga";
import ZonaDeError from "./components/ZonaDeError";
import { useAuth } from "./context/useAuth";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Adoption from "./pages/Adoption";
import PetDetail from "./pages/PetDetail";
import Contact from "./pages/Contact";
import NoEncontrada from "./pages/NoEncontrada";

// Carga diferida (#33): estas tres piezas se descargan en archivos aparte solo
// cuando alguien las necesita, así la primera visita baja menos código.
const PoliticaDatos = lazy(() => import("./pages/PoliticaDatos"));
const Checkout = lazy(() => import("./pages/Checkout"));
const RegisterModal = lazy(() => import("./components/RegisterModal"));

// Mientras llega una página diferida. El alto mínimo evita que el pie suba y
// baje (la página no "salta").
function CargandoPagina() {
  return (
    <div className="min-h-[60vh] px-4 py-12 md:px-6 md:py-20">
      <EstadoCarga tipo="cargando" titulo="Cargando la página…" />
    </div>
  );
}

// Si el archivo del registro no se pudo descargar (por ejemplo, sin conexión),
// se avisa aquí en vez de dejar toda la web en blanco.
const avisoRegistroFallido = (
  <div
    role="alert"
    className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-sm rounded-control bg-noche px-4 py-3 text-sm text-papel shadow-elevada"
  >
    No se pudo abrir el registro. Revisa tu conexión y recarga la página.
  </div>
);

export default function App() {
  const { pathname } = useLocation();
  const { showRegister } = useAuth();

  // El registro se descarga la primera vez que alguien lo abre y luego se
  // queda montado: así, si se cierra a medias, al reabrirlo conserva lo escrito
  // (como antes). Cambiar el estado durante el render es el patrón que React
  // recomienda para "recordar" algo que viene de otro estado.
  const [registroCargado, setRegistroCargado] = useState(false);
  if (showRegister && !registroCargado) setRegistroCargado(true);

  // Al cambiar de página se vuelve arriba (#21). "instant": sin desplazamiento
  // animado, también con "reducir movimiento".
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <>
      <Header />
      <div className="flex-1">
        <ZonaDeError ruta={pathname}>
          <Suspense fallback={<CargandoPagina />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/adopcion" element={<Adoption />} />
              <Route path="/adopcion/:id" element={<PetDetail />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/politica-de-datos" element={<PoliticaDatos />} />
              <Route path="*" element={<NoEncontrada />} />
            </Routes>
          </Suspense>
        </ZonaDeError>
      </div>
      <Footer />
      <CartModal />
      <AvisoCarrito />
      <LoginModal />
      {registroCargado && (
        <ZonaDeError ruta={pathname} respaldo={showRegister ? avisoRegistroFallido : null}>
          <Suspense fallback={null}>
            <RegisterModal />
          </Suspense>
        </ZonaDeError>
      )}
    </>
  );
}
