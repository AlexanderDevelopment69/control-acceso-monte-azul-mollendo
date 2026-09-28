var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { borrarArchivo, guardarArchivo } from '../common/archivos-persona.util.js';
import { documentosActuales, esDocumentoVigente, evaluarIngreso, ultimasVersiones, } from '../eventos-acceso/validacion-acceso.engine.js';
const EMPRESA_SELECT = { select: { id: true, razonSocial: true } };
function evaluarCumplimiento(estado, documentos) {
    const resultado = evaluarIngreso({
        personaActiva: estado === 'activo',
        alcoholConforme: true,
        documentos: documentosActuales(documentos, new Date()),
    });
    return {
        habilitado: resultado.autorizado,
        dadoDeBaja: resultado.denegadoPorBaja,
        sinDocumentos: resultado.denegadoSinDocumentos,
        documentosVencidos: resultado.documentosVencidos,
    };
}
function validarNumeroDocumento(tipo, numero) {
    if (tipo === 'DNI' && !/^\d{8}$/.test(numero)) {
        throw new BadRequestException('El DNI debe tener 8 dígitos');
    }
}
let PersonasService = class PersonasService {
    prisma;
    auditoriaService;
    eventEmitter;
    constructor(prisma, auditoriaService, eventEmitter) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
        this.eventEmitter = eventEmitter;
    }
    async assertEmpresaExiste(empresaId) {
        const empresa = await this.prisma.empresa.findUnique({ where: { id: empresaId } });
        if (!empresa) {
            throw new NotFoundException('Empresa no encontrada');
        }
    }
    async create(dto, user) {
        validarNumeroDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
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
            where: { empresaId: query.empresaId, estado: query.estado },
            include: {
                empresa: EMPRESA_SELECT,
                documentos: {
                    select: {
                        id: true,
                        tipoDocumentoId: true,
                        version: true,
                        fechaVencimiento: true,
                        tipoDocumento: { select: { nombre: true } },
                    },
                },
            },
            orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
        });
        return personas.map(({ documentos, ...persona }) => ({
            ...persona,
            cumplimiento: evaluarCumplimiento(persona.estado, documentos),
        }));
    }
    async findOne(id) {
        const persona = await this.prisma.persona.findUnique({
            where: { id },
            include: {
                empresa: EMPRESA_SELECT,
                documentos: { include: { tipoDocumento: true }, orderBy: [{ tipoDocumentoId: 'asc' }, { version: 'desc' }] },
            },
        });
        if (!persona) {
            throw new NotFoundException('Persona no encontrada');
        }
        const hoy = new Date();
        const documentosVigentes = [...ultimasVersiones(persona.documentos).values()]
            .map((doc) => ({
            id: doc.id,
            tipoDocumentoId: doc.tipoDocumentoId,
            nombre: doc.tipoDocumento.nombre,
            version: doc.version,
            fechaVencimiento: doc.fechaVencimiento,
            creadoEn: doc.creadoEn,
            vigente: esDocumentoVigente(doc.fechaVencimiento, hoy),
        }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
        return {
            ...persona,
            cumplimiento: evaluarCumplimiento(persona.estado, persona.documentos),
            documentosActuales: documentosVigentes,
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
        const tipo = dto.tipoDocumentoIdentidad ?? persona.tipoDocumentoIdentidad;
        const numero = dto.numeroDocumento ?? persona.numeroDocumento;
        if (tipo !== persona.tipoDocumentoIdentidad || numero !== persona.numeroDocumento) {
            validarNumeroDocumento(tipo, numero);
            const otra = await this.prisma.persona.findUnique({
                where: { tipoDocumentoIdentidad_numeroDocumento: { tipoDocumentoIdentidad: tipo, numeroDocumento: numero } },
            });
            if (otra) {
                throw new ConflictException('Ya existe una persona registrada con ese documento');
            }
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
    async guardarFoto(id, foto, user) {
        const persona = await this.findPersona(id);
        const rutaArchivo = guardarArchivo(id, foto, 'foto-');
        let actualizada;
        try {
            actualizada = await this.prisma.persona.update({ where: { id }, data: { fotoUrl: rutaArchivo } });
        }
        catch (error) {
            borrarArchivo(rutaArchivo);
            throw error;
        }
        borrarArchivo(persona.fotoUrl);
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'persona',
            registroId: id,
            accion: 'modificar',
        });
        this.eventEmitter.emit('persona.foto-actualizada', {
            personaId: id,
            tipoDocumentoIdentidad: actualizada.tipoDocumentoIdentidad,
            numeroDocumento: actualizada.numeroDocumento,
            rutaFoto: rutaArchivo,
        });
        return actualizada;
    }
    async rutaFoto(id) {
        const persona = await this.findPersona(id);
        if (!persona.fotoUrl || !existsSync(persona.fotoUrl)) {
            throw new NotFoundException('El trabajador no tiene foto');
        }
        return resolve(persona.fotoUrl);
    }
};
PersonasService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService,
        EventEmitter2])
], PersonasService);
export { PersonasService };
//# sourceMappingURL=personas.service.js.map