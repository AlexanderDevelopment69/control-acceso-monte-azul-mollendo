var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { esDocumentoVigente, evaluarIngreso, tiposDocumentoVigentes, ultimasVersiones, } from '../eventos-acceso/validacion-acceso.engine.js';
const EMPRESA_SELECT = { select: { id: true, razonSocial: true } };
const PUESTO_CON_REQUISITOS = { include: { requisitos: { include: { tipoDocumento: true } } } };
function evaluarCumplimiento(persona, documentos) {
    const documentosRequeridos = (persona.puesto?.requisitos ?? [])
        .filter((r) => r.obligatorio)
        .map((r) => ({ tipoDocumentoId: r.tipoDocumentoId, nombre: r.tipoDocumento.nombre }));
    const resultado = evaluarIngreso({
        personaActiva: persona.estado === 'activo',
        tienePuesto: persona.puestoId !== null,
        alcoholConforme: true,
        documentosRequeridos,
        documentosVigentes: tiposDocumentoVigentes(documentos, new Date()),
    });
    return {
        habilitado: resultado.autorizado,
        dadoDeBaja: resultado.denegadoPorBaja,
        sinPuesto: resultado.denegadoSinPuesto,
        documentosFaltantes: resultado.documentosFaltantes,
    };
}
let PersonasService = class PersonasService {
    prisma;
    auditoriaService;
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    async assertEmpresaExiste(empresaId) {
        const empresa = await this.prisma.empresa.findUnique({ where: { id: empresaId } });
        if (!empresa) {
            throw new NotFoundException('Empresa no encontrada');
        }
    }
    async create(dto, user) {
        await this.assertEmpresaExiste(dto.empresaId);
        const existente = await this.prisma.persona.findUnique({
            where: {
                tipoDocumentoIdentidad_numeroDocumento: {
                    tipoDocumentoIdentidad: dto.tipoDocumentoIdentidad,
                    numeroDocumento: dto.numeroDocumento,
                },
            },
        });
        if (existente) {
            throw new ConflictException('Ya existe una persona registrada con ese documento');
        }
        const persona = await this.prisma.persona.create({
            data: dto,
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'persona',
            registroId: persona.id,
            accion: 'crear',
        });
        return persona;
    }
    async findAll(query) {
        const personas = await this.prisma.persona.findMany({
            where: { empresaId: query.empresaId, puestoId: query.puestoId, estado: query.estado },
            include: {
                empresa: EMPRESA_SELECT,
                puesto: PUESTO_CON_REQUISITOS,
                documentos: { select: { id: true, tipoDocumentoId: true, version: true, fechaVencimiento: true } },
            },
            orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
        });
        return personas.map(({ documentos, puesto, ...persona }) => ({
            ...persona,
            puesto: puesto && { id: puesto.id, nombre: puesto.nombre, caso: puesto.caso },
            cumplimiento: evaluarCumplimiento({ ...persona, puesto }, documentos),
        }));
    }
    async findOne(id) {
        const persona = await this.prisma.persona.findUnique({
            where: { id },
            include: {
                empresa: EMPRESA_SELECT,
                puesto: PUESTO_CON_REQUISITOS,
                documentos: { include: { tipoDocumento: true }, orderBy: [{ tipoDocumentoId: 'asc' }, { version: 'desc' }] },
            },
        });
        if (!persona) {
            throw new NotFoundException('Persona no encontrada');
        }
        const hoy = new Date();
        const ultimas = ultimasVersiones(persona.documentos);
        const requisitos = (persona.puesto?.requisitos ?? [])
            .map((r) => {
            const documento = ultimas.get(r.tipoDocumentoId) ?? null;
            return {
                tipoDocumentoId: r.tipoDocumentoId,
                nombre: r.tipoDocumento.nombre,
                obligatorio: r.obligatorio,
                documento: documento && {
                    id: documento.id,
                    version: documento.version,
                    fechaVencimiento: documento.fechaVencimiento,
                    creadoEn: documento.creadoEn,
                },
                vigente: documento ? esDocumentoVigente(documento.fechaVencimiento, hoy) : false,
            };
        })
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
        const { puesto, ...resto } = persona;
        return {
            ...resto,
            puesto: puesto && { id: puesto.id, nombre: puesto.nombre, caso: puesto.caso },
            cumplimiento: evaluarCumplimiento(persona, persona.documentos),
            requisitos,
        };
    }
    async findPersona(id) {
        const persona = await this.prisma.persona.findUnique({ where: { id } });
        if (!persona) {
            throw new NotFoundException('Persona no encontrada');
        }
        return persona;
    }
    async update(id, dto, user) {
        const persona = await this.findPersona(id);
        if (dto.empresaId !== undefined && dto.empresaId !== persona.empresaId) {
            await this.assertEmpresaExiste(dto.empresaId);
        }
        const actualizada = await this.prisma.persona.update({ where: { id: persona.id }, data: dto });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'persona',
            registroId: persona.id,
            accion: 'modificar',
        });
        return actualizada;
    }
    async updateEstado(id, dto, user) {
        const persona = await this.findPersona(id);
        const actualizada = await this.prisma.persona.update({
            where: { id: persona.id },
            data: { estado: dto.estado },
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'persona',
            registroId: persona.id,
            accion: 'modificar',
        });
        return actualizada;
    }
};
PersonasService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], PersonasService);
export { PersonasService };
//# sourceMappingURL=personas.service.js.map