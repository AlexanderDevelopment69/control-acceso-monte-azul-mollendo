import ExcelJS from 'exceljs';
import {
  generarPlantillaCarga,
  leerFilasCarga,
  revisarFilasCarga,
  type EmpresaCarga,
  type FilaCarga,
  type PersonaExistente,
} from './carga-masiva.util.js';

const EMPRESAS: EmpresaCarga[] = [
  { id: 1, ruc: '20123456789', razonSocial: 'DEMO Servicios Portuarios Islay S.A.', estado: 'activa' },
  { id: 2, ruc: '20999999999', razonSocial: 'Transportes Cerrados S.A.C.', estado: 'inactiva' },
];
const EXISTENTES: PersonaExistente[] = [
  { tipoDocumentoIdentidad: 'DNI', numeroDocumento: '48058719', nombres: 'Amiel', apellidos: 'Bautista', estado: 'activo' },
];

const fila = (n: number, datos: Partial<FilaCarga> = {}): FilaCarga => ({
  fila: n,
  perfil: 'Contratista',
  empresa: 'DEMO Servicios Portuarios Islay S.A.',
  tipoDocumento: 'DNI',
  numeroDocumento: '40000001',
  nombres: 'Juan',
  apellidos: 'Pérez',
  ...datos,
});

describe('revisión de la carga masiva', () => {
  it('fila correcta: lista para registrar, con la empresa y el perfil resueltos', () => {
    const [r] = revisarFilasCarga([fila(2, { perfil: 'proveedor', empresa: 'demo servicios portuarios islay sa', numeroDocumento: ' 4000 0001 ' })], EMPRESAS, []);
    expect(r.estado).toBe('lista');
    expect(r.persona).toEqual({
      empresaId: 1,
      perfil: 'subcontratista',
      tipoDocumentoIdentidad: 'DNI',
      numeroDocumento: '40000001',
      nombres: 'Juan',
      apellidos: 'Pérez',
    });
  });

  it('acepta la empresa por RUC y el carné de extranjería escrito completo', () => {
    const [r] = revisarFilasCarga([fila(2, { empresa: '20123456789', tipoDocumento: 'Carné de extranjería', numeroDocumento: 'ab123' })], EMPRESAS, []);
    expect(r.estado).toBe('lista');
    expect(r.persona).toMatchObject({ empresaId: 1, tipoDocumentoIdentidad: 'CE', numeroDocumento: 'AB123' });
  });

  it('marca cada error con su motivo', () => {
    const filas = revisarFilasCarga(
      [
        fila(2, { empresa: 'Empresa Inventada', numeroDocumento: '40000002' }),
        fila(3, { empresa: 'Transportes Cerrados S.A.C.', numeroDocumento: '40000003' }),
        fila(4, { numeroDocumento: '1234567' }),
        fila(5, { perfil: 'Gerente', nombres: '', numeroDocumento: '40000005' }),
        fila(6, { tipoDocumento: 'Licencia', numeroDocumento: '40000006' }),
      ],
      EMPRESAS,
      [],
    );
    expect(filas.map((f) => f.estado)).toEqual(['error', 'error', 'error', 'error', 'error']);
    expect(filas[0].motivos).toEqual(['La empresa no está registrada en el sistema: "Empresa Inventada"']);
    expect(filas[1].motivos).toEqual(['La empresa está inactiva: Transportes Cerrados S.A.C.']);
    expect(filas[2].motivos).toEqual(['El DNI debe tener 8 dígitos']);
    expect(filas[3].motivos).toEqual(['Perfil desconocido: "Gerente"', 'Faltan los nombres']);
    expect(filas[4].motivos).toEqual(['Tipo de documento desconocido: "Licencia" (DNI, CE o PASAPORTE)']);
  });

  it('ya registrado: se omite; repetido en el archivo: error', () => {
    const filas = revisarFilasCarga(
      [fila(2, { numeroDocumento: '48058719' }), fila(3), fila(4)],
      EMPRESAS,
      EXISTENTES,
    );
    expect(filas[0]).toMatchObject({ estado: 'existe', motivos: ['Ya está registrado: Bautista, Amiel'] });
    expect(filas[1].estado).toBe('lista');
    expect(filas[2]).toMatchObject({ estado: 'error', motivos: ['El documento se repite: ya está en la fila 3'] });
  });
});

describe('lectura del Excel', () => {
  async function excel(filas: (string | number)[][]): Promise<Buffer> {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet('Personal');
    for (const f of filas) hoja.addRow(f);
    return Buffer.from(await libro.xlsx.writeBuffer());
  }

  it('lee las columnas por su título (en cualquier orden), salta filas vacías e ignora columnas de más', async () => {
    const contenido = await excel([
      ['Apellidos', 'Nombres', 'Número de documento', 'Tipo de documento', 'Empresa', 'Perfil', 'Motivo'],
      ['Pérez', 'Juan', 40000001, 'DNI', 'DEMO Servicios Portuarios Islay S.A.', 'Contratista', 'algo'],
      [],
      ['Rojas', 'Ana', '01234567', 'DNI', '20123456789', 'Conductor'],
    ]);
    const filas = await leerFilasCarga(contenido);
    expect(filas).toEqual([
      { fila: 2, perfil: 'Contratista', empresa: 'DEMO Servicios Portuarios Islay S.A.', tipoDocumento: 'DNI', numeroDocumento: '40000001', nombres: 'Juan', apellidos: 'Pérez' },
      { fila: 4, perfil: 'Conductor', empresa: '20123456789', tipoDocumento: 'DNI', numeroDocumento: '01234567', nombres: 'Ana', apellidos: 'Rojas' },
    ]);
  });

  it('sin la fila de títulos o con un archivo que no es Excel, avisa', async () => {
    await expect(leerFilasCarga(await excel([['Nombre', 'DNI']]))).rejects.toThrow(/No se encontró la fila de títulos/);
    await expect(leerFilasCarga(Buffer.from('no soy un excel'))).rejects.toThrow(/No se pudo leer el archivo/);
  });

  it('la plantilla se vuelve a leer, y el Excel de errores trae su motivo', async () => {
    const vacia = await generarPlantillaCarga(EMPRESAS);
    expect(await leerFilasCarga(vacia)).toEqual([]);

    const errores = await generarPlantillaCarga(EMPRESAS, [{ ...fila(7, { numeroDocumento: '0123' }), motivo: 'El DNI debe tener 8 dígitos' }]);
    const [leida] = await leerFilasCarga(errores);
    expect(leida).toMatchObject({ fila: 2, numeroDocumento: '0123', nombres: 'Juan' });

    const libro = new ExcelJS.Workbook();
    await libro.xlsx.load(errores as unknown as ArrayBuffer);
    expect(libro.getWorksheet('Personal')!.getCell('G2').value).toBe('El DNI debe tener 8 dígitos');
    expect(libro.getWorksheet('Personal')!.getCell('B2').dataValidation).toMatchObject({ type: 'list' });
  });
});
