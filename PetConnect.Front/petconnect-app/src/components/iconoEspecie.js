import { Cat, Dog, PawPrint } from "lucide-react";
import { normalizarTexto } from "../utils/texto";

// Ícono del respaldo de la foto según la especie (Fase 7, D7.3). Lo usan la
// tarjeta de adopción (TarjetaMascota.jsx) y la ficha (PetDetail.jsx, Fase 8),
// por eso vive en su propio archivo (D8.2).
// No importan tildes ni mayúsculas: "perro", "Perra", "GATO", "gatito"…

/** Dog si empieza por "perr", Cat si empieza por "gat"; PawPrint para otra especie o ninguna. */
export function iconoEspecie(especie) {
  const nombre = normalizarTexto(especie).trim();
  if (nombre.startsWith("perr")) return Dog;
  if (nombre.startsWith("gat")) return Cat;
  return PawPrint; // otra especie, o la API no la mandó
}
