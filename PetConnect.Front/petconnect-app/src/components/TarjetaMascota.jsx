import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import FotoConRespaldo from "./FotoConRespaldo";
import { iconoEspecie } from "./iconoEspecie";
import { rasgosMascota } from "../utils/mascota";

// Fase 7 del rediseño: tarjeta de una mascota en adopción (§4.2 punto 4).
// Antes era casi igual a la de producto: la mascota se veía como una bolsa de
// croquetas. Ahora se distingue así:
//   - La foto manda: vertical (4:5) y a todo el ancho, también en el celular
//     (la de producto es horizontal en el celular y de 4:3).
//   - El nombre va con la letra de títulos (font-display) y es un h2.
//   - La especie va en una etiqueta terracota y los rasgos (raza, edad, sexo)
//     en etiquetas aparte, no en una línea con " · ".
//   - "Conocer más" es terracota (acento); el botón de producto es turquesa.
// Solo se muestra lo que manda la API: nada de vacunas, tamaño ni esterilización.
// El ícono por especie (sin foto) está en iconoEspecie.js desde la Fase 8.

export default function TarjetaMascota({ pet }) {
  const enlace = `/adopcion/${pet.id}`;
  const nombre = typeof pet.name === "string" ? pet.name.trim() : "";
  const especie = typeof pet.species === "string" ? pet.species.trim() : "";
  const rasgos = rasgosMascota(pet);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-tarjeta border border-borde bg-superficie">
      {/* La foto lleva al mismo lugar que el nombre: se salta con Tab
          (tabIndex -1) y el lector de pantalla no repite el enlace. */}
      <Link to={enlace} tabIndex={-1} aria-hidden="true" className="block">
        <FotoConRespaldo
          src={pet.image}
          alt={nombre}
          icono={iconoEspecie(especie)}
          tono="acento"
          className="aspect-[4/5] w-full"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* flex-wrap: si el nombre es muy largo, la especie baja de renglón en
            vez de aplastarse (#5 de §3.3). */}
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h2 className="min-w-0 flex-1 basis-40 font-display text-xl font-normal leading-snug text-tinta">
            <Link
              to={enlace}
              title={nombre}
              className="line-clamp-2 break-words text-pretty text-tinta no-underline underline-offset-4 hover:underline"
            >
              {nombre}
            </Link>
          </h2>
          {especie && (
            <span className="max-w-full shrink-0 break-words rounded-control bg-acento-claro px-2.5 py-1 text-sm font-semibold text-acento-oscuro">
              {especie}
            </span>
          )}
        </div>

        {/* Si no se conoce ningún rasgo, no queda un renglón vacío */}
        {rasgos.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label={`Rasgos de ${nombre}`}>
            {rasgos.map((rasgo) => (
              <li
                key={rasgo}
                className="max-w-full break-words rounded-control border border-borde bg-papel px-2.5 py-1 text-sm text-tinta-suave"
              >
                {rasgo}
              </li>
            ))}
          </ul>
        )}

        <Link
          to={enlace}
          className="presionable mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-acento px-4 text-base font-semibold text-superficie no-underline hover:bg-acento-oscuro"
        >
          <Heart className="h-4 w-4 shrink-0" aria-hidden="true" />
          Conocer más
          {/* El lector de pantalla dice de quién: hay muchos enlaces iguales */}
          <span className="sr-only">: {nombre}</span>
        </Link>
      </div>
    </article>
  );
}
