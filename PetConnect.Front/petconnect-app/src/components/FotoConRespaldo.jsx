import { useState } from "react";
import { PawPrint } from "lucide-react";

// Fase 3 del rediseño (#27): en la BD imagen_url puede ser NULL y una foto
// puede fallar al cargar. Antes salía el ícono de "imagen rota" del navegador.
// Ahora se muestra un recuadro propio: un ícono de lucide sobre un color de los
// tokens. Nunca una foto genérica (no sería ESE producto ni ESA mascota).
//
// Sirve para productos (icono Package, tono "marca") y mascotas (PawPrint,
// tono "acento") en las fases 4, 5, 7 y 8.
//
// "className" da el tamaño y la forma (alto, ancho, radio): se aplica igual a la
// foto y al respaldo, así la tarjeta no salta si la foto falla.

const TONOS = {
  marca: "bg-marca-claro text-marca",
  acento: "bg-acento-claro text-acento-oscuro",
};

export default function FotoConRespaldo({
  src,
  alt,
  icono: Icono = PawPrint,
  tono = "marca",
  className = "",
  loading = "lazy",
}) {
  // Se guarda QUÉ dirección falló: si llega otra (otro producto), se intenta
  // de nuevo sin necesidad de un useEffect.
  const [srcFallido, setSrcFallido] = useState(null);
  const mostrarRespaldo = !src || srcFallido === src;

  if (mostrarRespaldo) {
    // Con alt vacío la foto es decorativa: el respaldo también lo es.
    const describir = Boolean(alt);
    return (
      <div
        className={`flex items-center justify-center ${TONOS[tono] ?? TONOS.marca} ${className}`}
        role={describir ? "img" : undefined}
        aria-label={describir ? `${alt} (sin foto)` : undefined}
        aria-hidden={describir ? undefined : "true"}
      >
        <Icono className="h-1/3 max-h-16 w-1/3 max-w-16" strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setSrcFallido(src)}
      className={`object-cover ${className}`}
    />
  );
}
