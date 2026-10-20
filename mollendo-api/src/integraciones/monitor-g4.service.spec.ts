import { MonitorG4Service } from './monitor-g4.service.js';

const T = '\t';
const linea = (dni: string, hora: string, numero: number, alcohol: string) =>
  [dni, hora, '255', '15', '0', '0', '0', '255', '0', '0', String(numero), alcohol, '-', '-', '-'].join(T);

function fila(id: number, dni: string, hora: string, llegada: string, numero: number, alcohol: string, extra: object = {}) {
  return {
    id,
    dispositivoId: 1,
    dispositivo: { serialNumber: 'HSR3263100192' },
    horaDispositivo: new Date(`${hora}-05:00`),
    creadoEn: new Date(`${llegada}-05:00`),
    crudo: linea(dni, hora.replace('T', ' '), numero, alcohol),
    decision: null,
    eventoAcceso: null,
    ...extra,
  };
}

describe('Monitor del G4 Pro', () => {
  it('muestra quién sopló, la demora, el grado, la decisión, el ingreso y las pruebas que no llegaron', async () => {
    const filas = [
      fila(30, '71988749', '2026-10-19T18:27:00', '2026-10-19T18:27:02.600', 28, '0.00g/L', {
        decision: 'Aprobó: "pase su DNI" (15 s)',
        eventoAcceso: {
          id: 500,
          resultado: 'autorizado',
          fechaHora: new Date('2026-10-19T18:27:04-05:00'),
          denegadoNoRegistrado: false,
          denegadoPorBaja: false,
          denegadoSinDocumentos: false,
          denegadoPorDocumentos: false,
          denegadoPorAlcohol: false,
          denegadoSinVerificacion: false,
        },
      }),
      fila(29, '99999999', '2026-10-19T18:20:00', '2026-10-19T18:20:16', 25, '0.000379g/L'),
      fila(28, '71988749', '2026-10-19T18:10:00', '2026-10-19T18:10:11', 24, '0.00g/L'),
    ];
    const prisma = {
      verificacionDispositivo: { findMany: () => Promise.resolve(filas) },
      persona: {
        findMany: () =>
          Promise.resolve([{ id: 7, numeroDocumento: '71988749', nombres: 'Jose', apellidos: 'Vilchez', fotoUrl: 'x.jpg' }]),
      },
    };
    const monitor = new MonitorG4Service(prisma as never);

    const [ultima, conAlcohol] = await monitor.ultimas(2);

    expect(ultima).toMatchObject({
      numero: 28,
      faltanAntes: 2, // llegaron la 25 y la 28: faltan la 26 y la 27
      dni: '71988749',
      persona: { id: 7, nombres: 'Jose', apellidos: 'Vilchez', tieneFoto: true },
      demoraSegundos: 2, // llegó 18:27:02,6: se ve 18:27:02, son 2 s (no 3)
      alcohol: '0.00g/L',
      aprobado: true,
      decision: 'Aprobó: "pase su DNI" (15 s)',
      ingreso: { id: 500, resultado: 'autorizado', motivo: '' },
    });
    // DNI que no está en el sistema; la anterior (24) es la de una más, que no se muestra.
    expect(conAlcohol).toMatchObject({ numero: 25, faltanAntes: 0, persona: null, demoraSegundos: 16, aprobado: false, ingreso: null });
  });
});
