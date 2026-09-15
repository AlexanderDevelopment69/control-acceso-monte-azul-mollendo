var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { evaluarIngreso, evaluarSalida } from './validacion-acceso.engine.js';
let EventosAccesoService = class EventosAccesoService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async findPersonaPorDocumento(tipoDocumentoIdentidad, numeroDocumento) {
        const persona = await this.prisma.persona.findUnique({
            where: {
                tipoDocumentoIdentidad_numeroDocumento: {
                    tipoDocumentoIdentidad: tipoDocumentoIdentidad,
                    numeroDocumento,
                },
            },
        });
        if (!persona) {
            throw new NotFoundException('Persona no registrada en el sistema');
        }
        return persona;
    }
    async getDocumentosRequeridos(puestoId) {
        if (!puestoId) {
            return [];
        }
        const requisitos = await this.prisma.requisitoPorPuesto.findMany({
            where: { puestoId, obligatorio: true },
            include: { tipoDocumento: true },
        });
        return requisitos.map((r) => ({ tipoDocumentoId: r.tipoDocumentoId, nombre: r.tipoDocumento.nombre }));
    }
    async getDocumentosVigentesAprobados(personaId) {
        const documentos = await this.prisma.documentoPersona.findMany({
            where: { personaId },
            orderBy: { version: 'desc' },
        });
        const ultimaVersionPorTipo = new Map();
        for (const doc of documentos) {
            if (!ultimaVersionPorTipo.has(doc.tipoDocumentoId)) {
                ultimaVersionPorTipo.set(doc.tipoDocumentoId, doc);
            }
        }
        const hoy = new Date();
        const vigentesAprobados = new Set();
        for (const [tipoDocumentoId, doc] of ultimaVersionPorTipo) {
            const vigente = doc.fechaVencimiento ? doc.fechaVencimiento >= hoy : true;
            if (doc.estadoAprobacion === 'aprobado' && vigente) {
                vigentesAprobados.add(tipoDocumentoId);
            }
        }
        return vigentesAprobados;
    }
    async registrarIngreso(dto) {
        const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
        const [documentosRequeridos, documentosVigentesAprobados] = await Promise.all([
            this.getDocumentosRequeridos(persona.puestoId),
            this.getDocumentosVigentesAprobados(persona.id),
        ]);
        const resultado = evaluarIngreso({
            personaActiva: persona.estado === 'activo',
            alcoholConforme: dto.alcoholConforme,
            documentosRequeridos,
            documentosVigentesAprobados,
        });
        const evento = await this.prisma.eventoAcceso.create({
            data: {
                personaId: persona.id,
                tipoMovimiento: 'ingreso',
                resultado: resultado.autorizado ? 'autorizado' : 'denegado',
                denegadoPorBaja: resultado.denegadoPorBaja,
                denegadoPorAlcohol: resultado.denegadoPorAlcohol,
                denegadoPorDocumentos: resultado.denegadoPorDocumentos,
                torniqueteId: dto.torniqueteId,
            },
        });
        const respuesta = {
            eventoId: evento.id,
            resultado: evento.resultado,
            persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
            motivos: {
                dadoDeBaja: resultado.denegadoPorBaja,
                alcohol: resultado.denegadoPorAlcohol,
                documentos: resultado.denegadoPorDocumentos,
                documentosFaltantes: resultado.documentosFaltantes,
            },
        };
        this.eventEmitter.emit('evento-acceso.registrado', respuesta);
        return respuesta;
    }
    async registrarSalida(dto) {
        const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
        const ultimoAutorizado = await this.prisma.eventoAcceso.findFirst({
            where: { personaId: persona.id, resultado: 'autorizado' },
            orderBy: { fechaHora: 'desc' },
        });
        const resultado = evaluarSalida(ultimoAutorizado?.tipoMovimiento ?? null);
        const evento = await this.prisma.eventoAcceso.create({
            data: {
                personaId: persona.id,
                tipoMovimiento: 'salida',
                resultado: resultado.autorizado ? 'autorizado' : 'denegado',
                denegadoSinIngresoPrevio: resultado.denegadoSinIngresoPrevio,
                torniqueteId: dto.torniqueteId,
            },
        });
        const respuesta = {
            eventoId: evento.id,
            resultado: evento.resultado,
            persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
            motivos: { sinIngresoPrevio: resultado.denegadoSinIngresoPrevio },
        };
        this.eventEmitter.emit('evento-acceso.registrado', respuesta);
        return respuesta;
    }
    async findAll(query) {
        return this.prisma.eventoAcceso.findMany({
            where: {
                personaId: query.personaId,
                resultado: query.resultado,
                fechaHora: {
                    gte: query.desde ? new Date(query.desde) : undefined,
                    lte: query.hasta ? new Date(query.hasta) : undefined,
                },
            },
            include: { persona: { select: { id: true, nombres: true, apellidos: true, empresaId: true } } },
            orderBy: { fechaHora: 'desc' },
            take: 500,
        });
    }
};
EventosAccesoService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        EventEmitter2])
], EventosAccesoService);
export { EventosAccesoService };
//# sourceMappingURL=eventos-acceso.service.js.map