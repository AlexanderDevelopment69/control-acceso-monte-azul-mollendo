import { DOCUMENTOS_PERSONAL, documentoDeLaLista } from './documentos-personal.js';
import { TiposDocumentoService } from './tipos-documento.service.js';

describe('Documentos del personal (lista fija)', () => {
  it('reconoce los cinco nombres, sin importar mayúsculas ni espacios', () => {
    expect(DOCUMENTOS_PERSONAL).toHaveLength(5);
    expect(documentoDeLaLista('  sctr salud y pensión ')).toBe('SCTR Salud y Pensión');
    expect(documentoDeLaLista('Certificado de Inducción SSMA – Visitas')).toBe('Certificado de Inducción SSMA – Visitas');
    expect(documentoDeLaLista('SCTR')).toBeNull();
    expect(documentoDeLaLista('Licencia de conducir')).toBeNull();
  });

  it('solo crea documentos de la lista, con el nombre de la lista', async () => {
    const creados: string[] = [];
    const prisma = {
      tipoDocumento: {
        findFirst: async () => null,
        create: async ({ data }: { data: { nombre: string } }) => (creados.push(data.nombre), { id: 9, nombre: data.nombre }),
      },
    };
    const servicio = new TiposDocumentoService(prisma as never, { registrar: async () => {} } as never);
    await expect(servicio.create({ nombre: 'Otro documento' }, 1)).rejects.toThrow('Seleccione un documento de la lista');
    await servicio.create({ nombre: 'certificado de aptitud médico ocupacional (camo)' }, 1);
    expect(creados).toEqual(['Certificado de Aptitud Médico Ocupacional (CAMO)']);
  });
});
