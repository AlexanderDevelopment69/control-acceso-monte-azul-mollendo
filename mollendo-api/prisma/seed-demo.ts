// Datos de simulación realistas para probar el sistema con algo más que las
// 2 cuentas mínimas de seed.ts — 3 empresas proveedoras adicionales, un
// catálogo de puestos/documentos del rubro portuario, personal con
// documentos en distintos estados (aprobado, pendiente, rechazado, vencido),
// solicitudes de visita y un historial de eventos de ingreso/salida (algunos
// autorizados, otros denegados por cada motivo posible) para que el
// dashboard, el panel de vigilancia y la auditoría tengan algo real que
// mostrar. No se usa en producción — es solo para desarrollo/demostración.
//
// Es re-ejecutable sin duplicar datos: si la empresa "Transportes Costa Sur"
// ya existe, el script no hace nada más y termina.
import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import type { AccionAuditoria } from '../src/generated/prisma/enums.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const DEMO_PASSWORD = process.env.EMPRESA_DEMO_PASSWORD ?? 'Cambiar123!';

function hace(dias: number, hora = 9, minuto = 0): Date {
  const fecha = new Date();
  fecha.setHours(hora, minuto, 0, 0);
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
}

function enDias(dias: number, hora = 9, minuto = 0): Date {
  return hace(-dias, hora, minuto);
}

async function auditar(usuarioId: number, tablaAfectada: string, registroId: number, accion: AccionAuditoria, fechaHora: Date) {
  await prisma.auditoria.create({ data: { usuarioId, tablaAfectada, registroId, accion, fechaHora } });
}

async function main() {
  const yaSembrado = await prisma.empresa.findUnique({ where: { ruc: '20456789013' } });
  if (yaSembrado) {
    console.log('Los datos de simulación ya existen (RUC 20456789013 encontrado) — no se vuelve a sembrar.');
    return;
  }

  const adminInterno = await prisma.usuario.findFirst({ where: { rol: 'administracion' } });
  if (!adminInterno) {
    throw new Error('No hay un usuario de Administración todavía — corre primero "npm run db:seed".');
  }

  // ---------------------------------------------------------------------
  // Tipos de documento (catálogo del rubro portuario)
  // ---------------------------------------------------------------------
  const tiposData = [
    { nombre: 'SCTR', tipoValidacion: 'fecha_vencimiento' as const },
    { nombre: 'Certificado médico ocupacional', tipoValidacion: 'fecha_vencimiento' as const },
    { nombre: 'Curso de inducción en seguridad portuaria', tipoValidacion: 'fecha_vencimiento' as const },
    { nombre: 'Carné de vacunación (fiebre amarilla)', tipoValidacion: 'si_no' as const },
    { nombre: 'Licencia de conducir A-IIIc', tipoValidacion: 'fecha_vencimiento' as const },
    { nombre: 'Constancia de antecedentes penales', tipoValidacion: 'vigente_por_actividad' as const },
  ];
  const tipos: Record<string, { id: number }> = {};
  for (const [i, t] of tiposData.entries()) {
    const creado = await prisma.tipoDocumento.create({ data: t });
    tipos[t.nombre] = creado;
    await auditar(adminInterno.id, 'tipo_documento', creado.id, 'crear', hace(21 - i));
  }
  const SCTR = tipos['SCTR'].id;
  const CERT_MEDICO = tipos['Certificado médico ocupacional'].id;
  const CURSO_INDUCCION = tipos['Curso de inducción en seguridad portuaria'].id;
  const CARNE_VACUNA = tipos['Carné de vacunación (fiebre amarilla)'].id;
  const LICENCIA = tipos['Licencia de conducir A-IIIc'].id;

  // ---------------------------------------------------------------------
  // Puestos + matriz de requisitos
  // ---------------------------------------------------------------------
  const puestosData = [
    { nombre: 'Estibador', caso: 'personal_propio' as const, requisitos: [[SCTR, true], [CERT_MEDICO, true], [CURSO_INDUCCION, true], [CARNE_VACUNA, false]] },
    { nombre: 'Operador de grúa portuaria', caso: 'personal_propio' as const, requisitos: [[SCTR, true], [CERT_MEDICO, true], [CURSO_INDUCCION, true], [LICENCIA, true]] },
    { nombre: 'Supervisor de operaciones', caso: 'personal_propio' as const, requisitos: [[CURSO_INDUCCION, true], [CERT_MEDICO, false]] },
    { nombre: 'Técnico de mantenimiento', caso: 'contratista' as const, requisitos: [[SCTR, true], [CURSO_INDUCCION, true]] },
    { nombre: 'Soldador industrial', caso: 'contratista' as const, requisitos: [[SCTR, true], [CERT_MEDICO, true], [CURSO_INDUCCION, true]] },
    { nombre: 'Transportista de carga', caso: 'tercero' as const, requisitos: [[LICENCIA, true], [SCTR, true]] },
    { nombre: 'Visita administrativa', caso: 'visita' as const, requisitos: [[CARNE_VACUNA, false]] },
    { nombre: 'Visita técnica', caso: 'visita' as const, requisitos: [[CURSO_INDUCCION, true], [CARNE_VACUNA, false]] },
  ];
  const puestos: Record<string, { id: number }> = {};
  for (const [i, p] of puestosData.entries()) {
    const creado = await prisma.puesto.create({ data: { nombre: p.nombre, caso: p.caso } });
    puestos[p.nombre] = creado;
    await auditar(adminInterno.id, 'puesto', creado.id, 'crear', hace(20 - i));
    for (const [tipoDocumentoId, obligatorio] of p.requisitos) {
      await prisma.requisitoPorPuesto.create({
        data: { puestoId: creado.id, tipoDocumentoId: tipoDocumentoId as number, obligatorio: obligatorio as boolean },
      });
    }
    await auditar(adminInterno.id, 'requisito_por_puesto', creado.id, 'modificar', hace(20 - i, 9, 5));
  }

  // ---------------------------------------------------------------------
  // Empresas proveedoras + su usuario (activo, para poder probar el rol)
  // ---------------------------------------------------------------------
  const empresasData = [
    { ruc: '20456789013', razonSocial: 'Transportes Costa Sur S.A.C.', correoContacto: 'operaciones@costasur.pe', correoLogin: 'costasur@mollendo.local' },
    { ruc: '20512345678', razonSocial: 'Estibajes del Sur E.I.R.L.', correoContacto: 'gerencia@estibajesdelsur.pe', correoLogin: 'estibajes@mollendo.local' },
    { ruc: '20487654321', razonSocial: 'Mantenimiento Industrial Arequipa S.A.', correoContacto: 'contacto@miasa.pe', correoLogin: 'miasa@mollendo.local' },
  ];
  const empresas: Record<string, { id: number; usuarioId: number }> = {};
  const passwordHash = await hash(DEMO_PASSWORD, 10);
  for (const [i, e] of empresasData.entries()) {
    const empresa = await prisma.empresa.create({
      data: { ruc: e.ruc, razonSocial: e.razonSocial, correoContacto: e.correoContacto, estado: 'activa' },
    });
    await auditar(adminInterno.id, 'empresa', empresa.id, 'crear', hace(18 - i));
    const usuario = await prisma.usuario.create({
      data: {
        empresaId: empresa.id,
        rol: 'empresa',
        correo: e.correoLogin,
        passwordHash,
        estadoCuenta: 'activo',
      },
    });
    empresas[e.razonSocial] = { id: empresa.id, usuarioId: usuario.id };
  }

  // Reusar la empresa demo que ya crea seed.ts (empresa@mollendo.local)
  const empresaDemo = await prisma.empresa.findUnique({ where: { ruc: '20000000001' } });
  const usuarioDemo = empresaDemo
    ? await prisma.usuario.findFirst({ where: { empresaId: empresaDemo.id, rol: 'empresa' } })
    : null;
  if (empresaDemo && usuarioDemo) {
    empresas['Empresa Demo SAC'] = { id: empresaDemo.id, usuarioId: usuarioDemo.id };
  }

  // ---------------------------------------------------------------------
  // Personal por empresa
  // ---------------------------------------------------------------------
  type PersonaSeed = {
    empresa: string;
    dni: string;
    nombres: string;
    apellidos: string;
    puesto?: string;
    estado: 'activo' | 'inactivo';
    documentos: { tipo: number; estado: 'aprobado' | 'pendiente' | 'rechazado'; vencimientoDias?: number }[];
  };

  const personasData: PersonaSeed[] = [
    // Transportes Costa Sur
    { empresa: 'Transportes Costa Sur S.A.C.', dni: '45678912', nombres: 'Luis Alberto', apellidos: 'Quispe Mamani', puesto: 'Transportista de carga', estado: 'activo', documentos: [{ tipo: LICENCIA, estado: 'aprobado', vencimientoDias: 240 }, { tipo: SCTR, estado: 'aprobado', vencimientoDias: 150 }] },
    { empresa: 'Transportes Costa Sur S.A.C.', dni: '47123456', nombres: 'Rosa Elena', apellidos: 'Huamán Ccama', puesto: 'Transportista de carga', estado: 'activo', documentos: [{ tipo: LICENCIA, estado: 'pendiente' }, { tipo: SCTR, estado: 'aprobado', vencimientoDias: 90 }] },
    { empresa: 'Transportes Costa Sur S.A.C.', dni: '44892371', nombres: 'Jorge', apellidos: 'Condori Apaza', puesto: 'Visita administrativa', estado: 'activo', documentos: [{ tipo: CARNE_VACUNA, estado: 'aprobado' }] },
    { empresa: 'Transportes Costa Sur S.A.C.', dni: '48219765', nombres: 'Miguel Ángel', apellidos: 'Flores Ticona', puesto: 'Transportista de carga', estado: 'inactivo', documentos: [{ tipo: LICENCIA, estado: 'aprobado', vencimientoDias: -30 }, { tipo: SCTR, estado: 'rechazado' }] },

    // Estibajes del Sur
    { empresa: 'Estibajes del Sur E.I.R.L.', dni: '43567890', nombres: 'Carlos Alberto', apellidos: 'Mamani Choque', puesto: 'Estibador', estado: 'activo', documentos: [{ tipo: SCTR, estado: 'aprobado', vencimientoDias: 210 }, { tipo: CERT_MEDICO, estado: 'aprobado', vencimientoDias: 120 }, { tipo: CURSO_INDUCCION, estado: 'aprobado', vencimientoDias: 300 }] },
    { empresa: 'Estibajes del Sur E.I.R.L.', dni: '46781234', nombres: 'Juan Pablo', apellidos: 'Vilca Turpo', puesto: 'Estibador', estado: 'activo', documentos: [{ tipo: SCTR, estado: 'aprobado', vencimientoDias: -15 }, { tipo: CERT_MEDICO, estado: 'aprobado', vencimientoDias: 60 }, { tipo: CURSO_INDUCCION, estado: 'pendiente' }] },
    { empresa: 'Estibajes del Sur E.I.R.L.', dni: '41239876', nombres: 'Pedro Pablo', apellidos: 'Yucra Huanca', puesto: 'Operador de grúa portuaria', estado: 'activo', documentos: [{ tipo: SCTR, estado: 'aprobado', vencimientoDias: 180 }, { tipo: CERT_MEDICO, estado: 'aprobado', vencimientoDias: 90 }, { tipo: CURSO_INDUCCION, estado: 'aprobado', vencimientoDias: 270 }, { tipo: LICENCIA, estado: 'aprobado', vencimientoDias: 365 }] },
    { empresa: 'Estibajes del Sur E.I.R.L.', dni: '47890123', nombres: 'Ana María', apellidos: 'Ccopa Sucari', puesto: 'Supervisor de operaciones', estado: 'activo', documentos: [{ tipo: CURSO_INDUCCION, estado: 'aprobado', vencimientoDias: 330 }, { tipo: CERT_MEDICO, estado: 'aprobado', vencimientoDias: 150 }] },

    // Mantenimiento Industrial Arequipa
    { empresa: 'Mantenimiento Industrial Arequipa S.A.', dni: '42345678', nombres: 'Fernando José', apellidos: 'Rojas Peralta', puesto: 'Técnico de mantenimiento', estado: 'activo', documentos: [{ tipo: SCTR, estado: 'aprobado', vencimientoDias: 120 }, { tipo: CURSO_INDUCCION, estado: 'rechazado' }] },
    { empresa: 'Mantenimiento Industrial Arequipa S.A.', dni: '45012389', nombres: 'Marco Antonio', apellidos: 'Salas Delgado', puesto: 'Soldador industrial', estado: 'activo', documentos: [{ tipo: SCTR, estado: 'aprobado', vencimientoDias: 180 }, { tipo: CERT_MEDICO, estado: 'aprobado', vencimientoDias: 60 }, { tipo: CURSO_INDUCCION, estado: 'aprobado', vencimientoDias: 240 }] },
    { empresa: 'Mantenimiento Industrial Arequipa S.A.', dni: '48765432', nombres: 'Diego Alonso', apellidos: 'Zegarra Núñez', puesto: 'Visita técnica', estado: 'activo', documentos: [{ tipo: CURSO_INDUCCION, estado: 'aprobado', vencimientoDias: 365 }, { tipo: CARNE_VACUNA, estado: 'aprobado' }] },

    // Empresa Demo SAC
    { empresa: 'Empresa Demo SAC', dni: '46123789', nombres: 'Katherine Milagros', apellidos: 'Torres Begazo', puesto: 'Estibador', estado: 'activo', documentos: [{ tipo: SCTR, estado: 'aprobado', vencimientoDias: 150 }, { tipo: CERT_MEDICO, estado: 'aprobado', vencimientoDias: 90 }, { tipo: CURSO_INDUCCION, estado: 'aprobado', vencimientoDias: 270 }] },
    { empresa: 'Empresa Demo SAC', dni: '44567123', nombres: 'Renato Sebastián', apellidos: 'Apaza Quenta', puesto: 'Supervisor de operaciones', estado: 'activo', documentos: [{ tipo: CURSO_INDUCCION, estado: 'aprobado', vencimientoDias: 300 }, { tipo: CERT_MEDICO, estado: 'pendiente' }] },
    { empresa: 'Empresa Demo SAC', dni: '47234561', nombres: 'José Luis', apellidos: 'Mendoza Chura', puesto: 'Visita administrativa', estado: 'activo', documentos: [{ tipo: CARNE_VACUNA, estado: 'aprobado' }] },
    { empresa: 'Empresa Demo SAC', dni: '43890124', nombres: 'Lucía Fernanda', apellidos: 'Paredes Vilcapoma', estado: 'activo', documentos: [] },
  ];

  const personas: Record<string, { id: number; empresaId: number }> = {};
  for (const [i, p] of personasData.entries()) {
    const empresaInfo = empresas[p.empresa];
    const persona = await prisma.persona.create({
      data: {
        empresaId: empresaInfo.id,
        puestoId: p.puesto ? puestos[p.puesto].id : null,
        tipoDocumentoIdentidad: 'DNI',
        numeroDocumento: p.dni,
        nombres: p.nombres,
        apellidos: p.apellidos,
        estado: p.estado,
        creadoEn: hace(14 - Math.floor(i / 2)),
      },
    });
    personas[`${p.nombres} ${p.apellidos}`] = { id: persona.id, empresaId: empresaInfo.id };
    await auditar(empresaInfo.usuarioId, 'persona', persona.id, 'crear', hace(14 - Math.floor(i / 2)));

    for (const [j, doc] of p.documentos.entries()) {
      const fechaVencimiento = doc.vencimientoDias !== undefined ? enDias(doc.vencimientoDias) : null;
      const fechaCreacion = hace(10 - j, 11, 0);
      const documento = await prisma.documentoPersona.create({
        data: {
          personaId: persona.id,
          tipoDocumentoId: doc.tipo,
          fechaEmision: hace(30),
          fechaVencimiento,
          archivoUrl: null,
          vigente: fechaVencimiento ? fechaVencimiento >= new Date() : true,
          estadoAprobacion: doc.estado,
          creadoEn: fechaCreacion,
        },
      });
      await auditar(empresaInfo.usuarioId, 'documento_persona', documento.id, 'crear', fechaCreacion);
      if (doc.estado === 'aprobado') {
        await auditar(empresaInfo.usuarioId, 'documento_persona', documento.id, 'aprobar', hace(10 - j, 15, 0));
      } else if (doc.estado === 'rechazado') {
        await auditar(empresaInfo.usuarioId, 'documento_persona', documento.id, 'modificar', hace(10 - j, 15, 0));
      }
    }
  }

  // ---------------------------------------------------------------------
  // Solicitudes de visita
  // ---------------------------------------------------------------------
  const solicitudesData = [
    { persona: 'Jorge Condori Apaza', personaVisitada: 'Ing. Patricia Flores — Jefatura de Operaciones', motivo: 'Coordinación de rutas de transporte', fecha: enDias(1, 10, 0), estado: 'programada' as const },
    { persona: 'José Luis Mendoza Chura', personaVisitada: 'Administración OTP/MAS', motivo: 'Entrega de documentación contractual', fecha: hace(2, 9, 30), estado: 'completada' as const },
    { persona: 'Diego Alonso Zegarra Núñez', personaVisitada: 'Supervisión técnica de grúas', motivo: 'Mantenimiento preventivo programado', fecha: enDias(3, 8, 0), estado: 'programada' as const },
    { persona: 'Jorge Condori Apaza', personaVisitada: 'Ing. Patricia Flores — Jefatura de Operaciones', motivo: 'Visita reprogramada por el cliente', fecha: hace(5, 10, 0), estado: 'cancelada' as const },
  ];
  for (const s of solicitudesData) {
    const persona = personas[s.persona];
    const empresaUsuario = Object.values(empresas).find((e) => e.id === persona.empresaId)!;
    const solicitud = await prisma.solicitudVisita.create({
      data: {
        personaId: persona.id,
        empresaId: persona.empresaId,
        personaVisitada: s.personaVisitada,
        motivo: s.motivo,
        fechaHoraProgramada: s.fecha,
        estado: s.estado,
        creadoEn: s.fecha < new Date() ? s.fecha : hace(1),
      },
    });
    await auditar(empresaUsuario.usuarioId, 'solicitud_visita', solicitud.id, 'crear', solicitud.creadoEn);
  }

  // ---------------------------------------------------------------------
  // Eventos de acceso (hoy y ayer) — autorizados y denegados por cada motivo
  // ---------------------------------------------------------------------
  type EventoSeed = {
    persona: string;
    tipoMovimiento: 'ingreso' | 'salida';
    resultado: 'autorizado' | 'denegado';
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinIngresoPrevio?: boolean;
    dias: number;
    hora: number;
    minuto: number;
  };

  const eventosData: EventoSeed[] = [
    // Hoy
    { persona: 'Carlos Alberto Mamani Choque', tipoMovimiento: 'ingreso', resultado: 'autorizado', dias: 0, hora: 6, minuto: 5 },
    { persona: 'Pedro Pablo Yucra Huanca', tipoMovimiento: 'ingreso', resultado: 'autorizado', dias: 0, hora: 6, minuto: 10 },
    { persona: 'Juan Pablo Vilca Turpo', tipoMovimiento: 'ingreso', resultado: 'denegado', denegadoPorDocumentos: true, dias: 0, hora: 6, minuto: 15 },
    { persona: 'Katherine Milagros Torres Begazo', tipoMovimiento: 'ingreso', resultado: 'autorizado', dias: 0, hora: 6, minuto: 20 },
    { persona: 'Marco Antonio Salas Delgado', tipoMovimiento: 'ingreso', resultado: 'autorizado', dias: 0, hora: 6, minuto: 30 },
    { persona: 'Luis Alberto Quispe Mamani', tipoMovimiento: 'ingreso', resultado: 'autorizado', dias: 0, hora: 7, minuto: 0 },
    { persona: 'Miguel Ángel Flores Ticona', tipoMovimiento: 'ingreso', resultado: 'denegado', denegadoPorBaja: true, dias: 0, hora: 7, minuto: 5 },
    { persona: 'Ana María Ccopa Sucari', tipoMovimiento: 'ingreso', resultado: 'denegado', denegadoPorAlcohol: true, dias: 0, hora: 7, minuto: 30 },
    { persona: 'Fernando José Rojas Peralta', tipoMovimiento: 'ingreso', resultado: 'denegado', denegadoPorDocumentos: true, dias: 0, hora: 7, minuto: 45 },
    { persona: 'Renato Sebastián Apaza Quenta', tipoMovimiento: 'salida', resultado: 'denegado', denegadoSinIngresoPrevio: true, dias: 0, hora: 8, minuto: 0 },
    { persona: 'Carlos Alberto Mamani Choque', tipoMovimiento: 'salida', resultado: 'autorizado', dias: 0, hora: 14, minuto: 10 },
    { persona: 'Pedro Pablo Yucra Huanca', tipoMovimiento: 'salida', resultado: 'autorizado', dias: 0, hora: 14, minuto: 20 },
    { persona: 'Marco Antonio Salas Delgado', tipoMovimiento: 'salida', resultado: 'autorizado', dias: 0, hora: 15, minuto: 5 },
    // Ayer
    { persona: 'José Luis Mendoza Chura', tipoMovimiento: 'ingreso', resultado: 'autorizado', dias: 1, hora: 9, minuto: 0 },
    { persona: 'José Luis Mendoza Chura', tipoMovimiento: 'salida', resultado: 'autorizado', dias: 1, hora: 12, minuto: 30 },
    { persona: 'Diego Alonso Zegarra Núñez', tipoMovimiento: 'ingreso', resultado: 'autorizado', dias: 1, hora: 10, minuto: 0 },
  ];

  for (const ev of eventosData) {
    const persona = personas[ev.persona];
    await prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoMovimiento: ev.tipoMovimiento,
        resultado: ev.resultado,
        denegadoPorBaja: ev.denegadoPorBaja ?? false,
        denegadoPorAlcohol: ev.denegadoPorAlcohol ?? false,
        denegadoPorDocumentos: ev.denegadoPorDocumentos ?? false,
        denegadoSinIngresoPrevio: ev.denegadoSinIngresoPrevio ?? false,
        fechaHora: hace(ev.dias, ev.hora, ev.minuto),
        torniqueteId: 'T1',
      },
    });
  }

  console.log('Datos de simulación creados:');
  console.log(`  ${tiposData.length} tipos de documento, ${puestosData.length} puestos, ${empresasData.length} empresas nuevas (+ Empresa Demo SAC reutilizada)`);
  console.log(`  ${personasData.length} personas, ${personasData.reduce((n, p) => n + p.documentos.length, 0)} documentos, ${solicitudesData.length} solicitudes de visita, ${eventosData.length} eventos de acceso`);
  console.log('Cuentas de empresa nuevas (todas con la misma contraseña):');
  for (const e of empresasData) {
    console.log(`  ${e.razonSocial}: ${e.correoLogin} / ${DEMO_PASSWORD}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
