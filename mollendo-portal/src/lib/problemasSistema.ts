import type { EstadoSistema } from "@/lib/api/types";

// Más de 26 horas sin respaldo automático: alguno falló (se hace uno por día).
export const RESPALDO_ATRASADO_MS = 26 * 60 * 60 * 1000;

/**
 * Lo que "Sistema y APIs" muestra en rojo, en frases cortas, para el aviso de
 * arriba (AvisoSistema). Si el controlador de la garita está desconectado se
 * avisa una sola vez, no cada lector y relé que depende de él.
 */
export function problemasDelSistema(e: EstadoSistema): string[] {
  const problemas: string[] = [];

  if (e.baseDeDatos.estado !== "up") problemas.push("Base de datos sin conexión");
  if (!e.integraciones.claveEquiposConfigurada) problemas.push("Clave de equipos físicos no configurada");

  if (e.respaldos.disponible) {
    const ultimo = e.respaldos.ultimoAutomatico;
    if (!ultimo || new Date(e.api.fecha).getTime() - new Date(ultimo.fecha).getTime() > RESPALDO_ATRASADO_MS) {
      problemas.push("Respaldos atrasados");
    }
  }

  const controlador = e.controladorGarita;
  if (controlador?.remoto && !controlador.conectado) {
    problemas.push("Controlador de la garita desconectado: nadie puede ingresar");
  } else {
    for (const [nombre, lector] of [["ingreso", e.lectoresDni.ingreso], ["salida", e.lectoresDni.salida]] as const) {
      if (lector.configurado && !lector.conectado) problemas.push(`Lector de DNI de ${nombre} desconectado`);
    }
    const reles = e.releMolinetes;
    if (!reles.ingreso.conectado) problemas.push("Relé del molinete de ingreso no conectado");
    if (!reles.salida.conectado) problemas.push("Relé del molinete de salida no conectado");
    if (reles.avisoIngreso && !reles.avisoIngreso.conectado) problemas.push("Relé de aviso de ingreso no conectado");
    if (reles.avisoSalida && !reles.avisoSalida.conectado) problemas.push("Relé de aviso de salida no conectado");
  }

  for (const d of e.equipos.dispositivos) {
    if (!d.enLinea) problemas.push(`Equipo G4 Pro ${d.serialNumber} desconectado`);
  }

  return problemas;
}
