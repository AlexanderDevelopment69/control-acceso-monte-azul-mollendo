import { IntegracionesService } from '../integraciones/integraciones.service.js';
import { ReportesController } from '../reportes/reportes.controller.js';
import { DocumentosController } from '../documentos/documentos.controller.js';

// Acciones que quedan en la Auditoría además de los cambios de datos (21/10/2026):
// abrir el molinete a mano, sincronizar con el equipo facial, descargar un reporte
// y abrir el archivo de un documento. (Salida sin lector y Salida sin DNI: en
// eventos-acceso.flujo.spec.ts.)
const auditoriaFalsa = () => {
  const registros: Record<string, unknown>[] = [];
  return { registros, auditoria: { registrar: async (r: Record<string, unknown>) => void registros.push(r) } };
};
const admin = { id: 5, empresaId: 1, rol: 'administrador' as const, correo: 'admin@tmam.pe' };

describe('Auditoría: acciones sin cambio de datos', () => {
  const remotosAntes = process.env.MOLINETES_REMOTOS;
  afterEach(() => {
    process.env.MOLINETES_REMOTOS = remotosAntes;
  });

  it('molinete a mano, servidor en la nube: va al controlador y queda con quién lo abrió', async () => {
    process.env.MOLINETES_REMOTOS = 'true';
    const { registros, auditoria } = auditoriaFalsa();
    const ordenes: unknown[] = [];
    let conectado = true;
    const controlador = { estado: () => ({ conectado }), abrirMolinete: (o: unknown) => void ordenes.push(o) };
    const servicio = new IntegracionesService({} as never, {} as never, {} as never, auditoria as never, controlador as never);

    expect(await servicio.enviarComandoTorniquete({ torniqueteId: 'Salida', comando: 'abrir' }, admin.id)).toEqual({ enviado: true });
    expect(ordenes).toEqual([expect.objectContaining({ tipoMovimiento: 'salida' })]);
    conectado = false;
    expect(await servicio.enviarComandoTorniquete({ torniqueteId: 'ingreso', comando: 'abrir' }, admin.id)).toEqual({ enviado: false });
    expect(ordenes).toHaveLength(1);
    expect(registros).toEqual([
      expect.objectContaining({ usuarioId: 5, tablaAfectada: 'molinete', accion: 'apertura', detalle: 'Molinete de salida abierto a mano (por la API)' }),
      expect.objectContaining({ accion: 'apertura', detalle: 'Molinete de ingreso abierto a mano (por la API): el controlador no está conectado' }),
    ]);
  });

  it('sincronización con el equipo facial: queda con quién la ejecutó, también si falla', async () => {
    const { registros, auditoria } = auditoriaFalsa();
    const prisma = { sincronizacionG4: { create: async () => undefined } };
    // Sin equipos (pushSdk vacío) la sincronización falla: igual queda registrada.
    const servicio = new IntegracionesService({} as never, {} as never, prisma as never, auditoria as never, {} as never);
    await expect(servicio.sincronizarTodas(false, 'manual', admin.id)).rejects.toBeDefined();
    expect(registros).toEqual([
      expect.objectContaining({ usuarioId: 5, tablaAfectada: 'sincronizacion_g4', accion: 'ejecucion', detalle: expect.stringMatching(/^Sincronización: falló/) }),
    ]);
  });

  it('descarga de un reporte: cuál, en qué formato y con qué filtros', async () => {
    const { registros, auditoria } = auditoriaFalsa();
    const reporte = {
      titulo: 'Personal y empresas',
      archivo: 'reporte-personal',
      filtros: ['Perfil: Conductor'],
      columnas: [{ titulo: 'Persona', descripcion: 'Nombre.', ancho: 20 }],
      filas: [['Pérez, Juan']],
      resumen: [],
    };
    const controlador = new ReportesController({ generar: async () => reporte } as never, auditoria as never);
    await controlador.descargar('personal', { formato: 'xlsx' } as never, admin);
    expect(registros).toEqual([
      expect.objectContaining({ usuarioId: 5, tablaAfectada: 'reporte', accion: 'descarga', detalle: 'Personal y empresas (XLSX) · Perfil: Conductor' }),
    ]);
  });

  it('archivo de un documento: queda quién lo abrió y cuál era', async () => {
    const { registros, auditoria } = auditoriaFalsa();
    const archivo = { ruta: '/x.pdf', tipo: 'application/pdf', nombre: 'x.pdf', enLinea: true, descripcion: 'Abrió el archivo de “SCTR Salud” v2 de Pérez, Juan' };
    const controlador = new DocumentosController({ archivo: async () => archivo } as never, auditoria as never);
    const res = { setHeader: () => undefined, sendFile: () => undefined };
    await controlador.verArchivo(41, 9, res as never, admin);
    expect(registros).toEqual([
      expect.objectContaining({ usuarioId: 5, tablaAfectada: 'documento_persona', registroId: 9, accion: 'consulta', detalle: archivo.descripcion }),
    ]);
  });
});
