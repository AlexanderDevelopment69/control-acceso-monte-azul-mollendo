import ExcelJS from 'exceljs';
import {
  fechaCarga,
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
  autorizadoDesde: '',
  autorizadoHasta: '',
  motivoAutorizacion: '',
  documento: '',
  documentoVence: '',
  ...datos,
});

describe('revisión de la carga masiva', () => {
  it('documento (solo se muestra): vacío es el SCTR; de la lista sin importar mayúsculas; fuera de la lista, error', () => {
    const [vacio, camo, fuera] = revisarFilasCarga(
      [
        fila(2),
        fila(3, { numeroDocumento: '40000002', documento: 'certificado de aptitud médico ocupacional (camo)' }),
        fila(4, { numeroDocumento: '40000003', documento: 'Licencia' }),
      ],
      EMPRESAS,
      [],
    );
    expect(vacio).toMatchObject({ estado: 'lista', documentoNombre: 'SCTR Salud y Pensión' });
    expect(camo).toMatchObject({ estado: 'lista', documentoNombre: 'Certificado de Aptitud Médico Ocupacional (CAMO)' });
    expect(fuera).toMatchObject({ estado: 'error', campos: ['documento'] });
  });

  it('documento vence el (solo se muestra): la fila lista lleva la fecha; mal escrita, error en su columna', () => {
    const [bien, sin, mal] = revisarFilasCarga(
      [fila(2, { documentoVence: '31/12/2027' }), fila(3, { numeroDocumento: '40000002' }), fila(4, { numeroDocumento: '40000003', documentoVence: '31/13/2027' })],
      EMPRESAS,
      [],
    );
    expect(bien).toMatchObject({ estado: 'lista', documentoVenceEl: '2027-12-31' });
    expect(sin).toMatchObject({ estado: 'lista', documentoVenceEl: null });
    expect(mal).toMatchObject({ estado: 'error', campos: ['documentoVence'] });
  });

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
      autorizadoDesde: null,
      autorizadoHasta: null,
      motivoAutorizacion: null,
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
    expect(filas[0].motivos).toEqual(['La empresa no está registrada en el sistema (regístrela en Empresas): "Empresa Inventada"']);
    expect(filas[1].motivos).toEqual(['La empresa está inactiva (se activa en Empresas): Transportes Cerrados S.A.C.']);
    expect(filas[2].motivos).toEqual(['El DNI debe tener 8 dígitos']);
    expect(filas[3].motivos).toEqual(['Perfil desconocido: "Gerente"', 'Faltan los nombres']);
    expect(filas[4].motivos).toEqual(['Tipo de documento desconocido: "Licencia" (DNI, CE o PASAPORTE)']);
    // La columna de cada error, para pintarla en el Excel.
    expect(filas.map((f) => f.campos)).toEqual([['empresa'], ['empresa'], ['numeroDocumento'], ['perfil', 'nombres'], ['tipoDocumento']]);
  });

  it('ya registrado: se omite; repetido en el archivo: error', () => {
    const filas = revisarFilasCarga(
      [fila(2, { numeroDocumento: '48058719' }), fila(3), fila(4)],
      EMPRESAS,
      EXISTENTES,
    );
    expect(filas[0]).toMatchObject({ estado: 'existe', motivos: ['Ya está registrado: Bautista, Amiel'] });
    expect(filas[1].estado).toBe('lista');
    expect(filas[2]).toMatchObject({ estado: 'error', motivos: ['El documento se repite: ya está en la fila 3'], campos: ['numeroDocumento'] });
    expect(filas[0].campos).toEqual([]);
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
      // Una plantilla anterior, sin las columnas del período, sigue sirviendo: quedan vacías.
      { fila: 2, perfil: 'Contratista', empresa: 'DEMO Servicios Portuarios Islay S.A.', tipoDocumento: 'DNI', numeroDocumento: '40000001', nombres: 'Juan', apellidos: 'Pérez', autorizadoDesde: '', autorizadoHasta: '', motivoAutorizacion: '', documento: '', documentoVence: '' },
      { fila: 4, perfil: 'Conductor', empresa: '20123456789', tipoDocumento: 'DNI', numeroDocumento: '01234567', nombres: 'Ana', apellidos: 'Rojas', autorizadoDesde: '', autorizadoHasta: '', motivoAutorizacion: '', documento: '', documentoVence: '' },
    ]);
  });

  it('sin la fila de títulos o con un archivo que no es Excel, avisa', async () => {
    await expect(leerFilasCarga(await excel([['Nombre', 'DNI']]))).rejects.toThrow(/No se encontró la fila de títulos/);
    await expect(leerFilasCarga(Buffer.from('no soy un excel'))).rejects.toThrow(/No se pudo leer el archivo/);
  });

  it('la plantilla se vuelve a leer, y el Excel de errores trae su motivo', async () => {
    const vacia = await generarPlantillaCarga(EMPRESAS);
    expect(await leerFilasCarga(vacia)).toEqual([]);

    const errores = await generarPlantillaCarga(EMPRESAS, [
      { ...fila(7, { numeroDocumento: '0123', nombres: '' }), motivo: 'El DNI debe tener 8 dígitos. Faltan los nombres', campos: ['numeroDocumento', 'nombres'] },
    ]);
    const [leida] = await leerFilasCarga(errores);
    expect(leida).toMatchObject({ fila: 2, numeroDocumento: '0123', nombres: '' });

    const libro = new ExcelJS.Workbook();
    await libro.xlsx.load(errores as unknown as ArrayBuffer);
    const hoja = libro.getWorksheet('Personal')!;
    // El motivo va después de las 11 columnas (las 6 de la persona, las 3 del período y las 2 del documento).
    expect(hoja.getCell('L2').value).toBe('El DNI debe tener 8 dígitos. Faltan los nombres');
    // Pintadas en rojo claro: el número (D) y los nombres vacíos (E); las demás no.
    const pintada = (ref: string) => (hoja.getCell(ref).fill as ExcelJS.FillPattern | undefined)?.fgColor?.argb === 'FFFEE4E2';
    expect(['A2', 'B2', 'C2', 'D2', 'E2', 'F2'].map(pintada)).toEqual([false, false, false, true, true, false]);
    expect(hoja.getCell('B2').dataValidation).toMatchObject({ type: 'list' });
  });
});

describe('carga masiva: período de autorización', () => {
  it('las fechas se entienden como las escribe una persona (y el número de serie de Excel)', () => {
    expect(fechaCarga('22/10/2026')).toBe('2026-10-22');
    expect(fechaCarga('2/3/2026')).toBe('2026-03-02');
    expect(fechaCarga('22-10-2026')).toBe('2026-10-22');
    expect(fechaCarga('2026-10-22')).toBe('2026-10-22');
    expect(fechaCarga('46317')).toBe('2026-10-22');
    expect(fechaCarga('31/02/2026')).toBeNull();
    expect(fechaCarga('mañana')).toBeNull();
    expect(fechaCarga('')).toBeNull();
  });

  it('con período completo, la persona lleva sus fechas y el motivo', () => {
    const [r] = revisarFilasCarga(
      [fila(2, { autorizadoDesde: '22/10/2026', autorizadoHasta: '31/10/2026', motivoAutorizacion: ' Visita técnica ' })],
      EMPRESAS,
      [],
    );
    expect(r.estado).toBe('lista');
    expect(r.persona).toMatchObject({ autorizadoDesde: '2026-10-22', autorizadoHasta: '2026-10-31', motivoAutorizacion: 'Visita técnica' });
  });

  it('período incompleto, fecha mal escrita o al revés: error en su columna', () => {
    const [incompleto, malEscrita, alReves] = revisarFilasCarga(
      [
        fila(2, { numeroDocumento: '40000001', autorizadoDesde: '22/10/2026' }),
        fila(3, { numeroDocumento: '40000002', autorizadoDesde: '22/13/2026', autorizadoHasta: '31/10/2026', motivoAutorizacion: 'Obra' }),
        fila(4, { numeroDocumento: '40000003', autorizadoDesde: '31/10/2026', autorizadoHasta: '22/10/2026', motivoAutorizacion: 'Obra' }),
      ],
      EMPRESAS,
      [],
    );
    expect(incompleto).toMatchObject({ estado: 'error', motivos: [expect.stringContaining('Complete el período')] });
    expect(incompleto.campos).toEqual(['autorizadoHasta', 'motivoAutorizacion']);
    expect(malEscrita).toMatchObject({ estado: 'error', campos: ['autorizadoDesde'] });
    expect(alReves).toMatchObject({ estado: 'error', campos: ['autorizadoHasta'] });
  });

  it('lee una fecha guardada como fecha de Excel', async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet('Personal');
    hoja.addRow(['Perfil', 'Empresa', 'Tipo de documento', 'Número de documento', 'Nombres', 'Apellidos', 'Fecha de ingreso', 'Fecha de finalización', 'Motivo de la autorización']);
    hoja.addRow(['Visita', '20123456789', 'DNI', '07654321', 'Ana', 'Díaz', new Date(Date.UTC(2026, 9, 22)), new Date(Date.UTC(2026, 9, 31)), 'Visita técnica']);
    const [leida] = await leerFilasCarga(Buffer.from(await libro.xlsx.writeBuffer()));
    expect(leida).toMatchObject({ autorizadoDesde: '22/10/2026', autorizadoHasta: '31/10/2026', motivoAutorizacion: 'Visita técnica' });
  });
});
