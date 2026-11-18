import { useRef } from "react";
import { getMascotasAdopcion } from "../services/api";
import EstadoCarga from "../components/EstadoCarga";
import BotonVerMas from "../components/BotonVerMas";
import TarjetaMascota from "../components/TarjetaMascota";
import { useListaPaginada } from "../hooks/useListaPaginada";
import { POR_PAGINA_ADOPCION } from "../utils/paginacion";

// Fase 7 del rediseño: tokens de "Refugio cálido", tarjeta propia de mascota
// (TarjetaMascota.jsx) y sin título animado ni aparición al hacer scroll
// (§3.4: es una página de trabajo, no de presentación).
export default function Adoption() {
  // 3.3 (A-23, NC-009): la lista sale SOLO de la API. Antes empezaba con 6
  // mascotas inventadas y, si la API fallaba o no traía nada, las dejaba en
  // pantalla (así se ocultó NC-009).
  // 4.17 (NC-003): se pide de 12 en 12; "Ver más" trae las siguientes.
  const {
    items: pets,
    estado,
    reintentar,
    hayMas,
    verMas,
    cargandoMas,
    errorMas,
  } = useListaPaginada(getMascotasAdopcion, POR_PAGINA_ADOPCION);
  const tituloRef = useRef(null);
  // Fase 12 (D12.4): "Ver más" lleva el foco a la primera mascota nueva de esta lista
  const listaRef = useRef(null);

  // Al pulsar "Reintentar" el botón desaparece y el foco caería al inicio de la
  // página. Se pasa al título para que quien usa teclado siga en el mismo lugar
  // (igual que en Checkout, Fase 6).
  const reintentarYEnfocar = () => {
    reintentar();
    tituloRef.current?.focus();
  };

  return (
    <main className="page-enter mx-auto w-full max-w-7xl px-4 pb-12 pt-8 md:px-6 md:pb-20 md:pt-12">
      {/* React 19 sube <title> y <meta> al <head> mientras esta página está abierta (§3.6) */}
      <title>Mascotas en adopción · PetConnect</title>
      <meta
        name="description"
        content="Perros y gatos que buscan familia. Mira su ficha y envía tu solicitud en línea."
      />

      {/* tabIndex -1: recibe el foco tras "Reintentar", pero no es un control (sin contorno) */}
      <h1
        ref={tituloRef}
        tabIndex={-1}
        className="font-display text-3xl font-normal tracking-tight text-balance text-tinta outline-none md:text-4xl"
      >
        Mascotas en adopción
      </h1>
      <p className="mt-2 max-w-[60ch] text-base text-pretty text-tinta-suave">
        Perros y gatos que buscan familia. Mira su ficha y envía tu solicitud en línea.
      </p>

      <div className="mt-8">
        {estado === "cargando" && (
          <EstadoCarga tipo="cargando" titulo="Cargando mascotas en adopción…" />
        )}

        {estado === "error" && (
          <EstadoCarga
            tipo="error"
            titulo="No pudimos cargar las mascotas en adopción"
            onReintentar={reintentarYEnfocar}
          >
            Revisa tu conexión o inténtalo de nuevo en unos minutos.
          </EstadoCarga>
        )}

        {estado === "listo" && pets.length === 0 && (
          <EstadoCarga tipo="vacio" titulo="Por ahora no hay mascotas en adopción">
            Vuelve pronto: cuando un refugio publique una mascota, aparecerá aquí.
          </EstadoCarga>
        )}

        {estado === "listo" && pets.length > 0 && (
          // 1 columna en el celular (la foto manda), 2 desde 640 px, 3 desde 1024 y 4 desde 1280.
          <ul ref={listaRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pets.map((pet) => (
              <li key={pet.id}>
                <TarjetaMascota pet={pet} />
              </li>
            ))}
          </ul>
        )}

        {estado === "listo" && (
          <BotonVerMas
            hayMas={hayMas}
            cargando={cargandoMas}
            error={errorMas}
            onVerMas={verMas}
            texto="Ver más mascotas"
            listaRef={listaRef}
          />
        )}
      </div>
    </main>
  );
}
