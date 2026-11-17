// Datos de contacto del proyecto en un solo lugar (Fase 2 del rediseño, D3).
// Es el correo de atención del proyecto, no el de una persona.
// Ya lo usan Footer y ZonaDeError (Fase 2), AvisoDemo (Fase 6), FormularioSolicitud
// (Fase 8), LoginModal y CasillaAutorizacion (Fase 9) y Contact (Fase 10).
// Pendiente: PoliticaDatos (Fase 11) todavía tiene su propia copia (CORREO_DATOS).
// CIUDAD la usan Footer y Contact. El domicilio de la política ("Armenia, Quindío,
// Colombia") es texto legal y se queda escrito allá tal cual.
//
// OJO: este correo es parte del TEXTO LEGAL B.2 (lo muestra CasillaAutorizacion.jsx).
// Si cambia, hay que cambiar también B.2 en
// Documentacion/Legal/POLITICA-TRATAMIENTO-DATOS-v1.0-BORRADOR.md y subir la versión
// de la política (PoliticaDatos.jsx y VERSION_POLITICA_DATOS en api.py).
export const CORREO_ATENCION = "proyectopetconnect+atencion@gmail.com";

export const CIUDAD = "Armenia, Quindío";
