import { AlcoholimetroService, COMANDO_ALCOHOLIMETRO, alcoholimetroEnRespuesta } from './alcoholimetro.service.js';

describe('Alcoholímetro del equipo facial', () => {
  it('la respuesta del equipo dice si está conectado (sin el número no se sabe)', () => {
    expect(alcoholimetroEnRespuesta('2\n\n ')).toBe(true);
    expect(alcoholimetroEnRespuesta('0\n')).toBe(false);
    expect(alcoholimetroEnRespuesta('')).toBeNull();
    expect(alcoholimetroEnRespuesta('FIN')).toBeNull();
    expect(COMANDO_ALCOHOLIMETRO).toContain('PRODUCT=1a86/7523/');
    // Una sola orden: con varias separadas por ";" el equipo solo devuelve la última.
    expect(COMANDO_ALCOHOLIMETRO).not.toContain(';');
  });

  it('pregunta solo a los equipos en línea; sin respuesta queda como estaba', async () => {
    let respuesta: string | null = '2\n';
    const consultas: unknown[] = [];
    const pushSdk = {
      listarEstadoDispositivos: async () => [
        { serialNumber: 'G4A', enLinea: true },
        { serialNumber: 'G4B', enLinea: false },
      ],
      consultar: async (...args: unknown[]) => (consultas.push(args), respuesta),
    };
    const prisma = { dispositivoAcceso: { findMany: async () => [{ id: 1, serialNumber: 'G4A' }, { id: 2, serialNumber: 'G4B' }] } };
    const servicio = new AlcoholimetroService(prisma as never, pushSdk as never);

    expect(servicio.estado('G4A').conectado).toBeNull();
    await servicio.revisar();
    expect(consultas).toEqual([[1, COMANDO_ALCOHOLIMETRO, 20000, { silencioso: true, temporal: true }]]);
    expect(servicio.estado('G4A')).toMatchObject({ conectado: true });
    const visto = servicio.estado('G4A').conectadoVisto;

    respuesta = '0\n';
    await servicio.revisar();
    expect(servicio.estado('G4A')).toMatchObject({ conectado: false, conectadoVisto: visto });

    respuesta = null;
    await servicio.revisar();
    expect(servicio.estado('G4A').conectado).toBe(false);
    expect(servicio.estado('G4B').conectado).toBeNull();
  });
});
