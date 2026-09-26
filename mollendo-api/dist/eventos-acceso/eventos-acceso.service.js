var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { evaluarIngreso, tiposDocumentoVigentes } from './validacion-acceso.engine.js';
let EventosAccesoService = class EventosAccesoService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    findPersonaPorDocumento(tipoDocumentoIdentidad, numeroDocumento) {
        return this.prisma.persona.findUnique({
            where: { tipoDocumentoIdentidad_numeroDocumento: { tipoDocumentoIdentidad, numeroDocumento } },
        });
    }
    responderNoRegistrada(numeroDocumento, tipoMovimiento) {
        const respuesta = {
            eventoId: null,
            tipoMovimiento,
            resultado: 'denegado',
            fechaHora: new Date().toISOString(),
            persona: null,
            numeroDocumento,
            motivos: { personaNoRegistrada: true },
        };
        this.eventEmitter.emit('evento-acceso.registrado', respuesta);
        return respuesta;
    }
    async getDocumentosRequeridos(puestoId) {
        const requisitos = await this.prisma.requisitoPorPuesto.findMany({
            where: { puestoId, obligatorio: true },
            include: { tipoDocumento: true },
        });
        return requisitos.map((r) => ({ tipoDocumentoId: r.tipoDocumentoId, nombre: r.tipoDocumento.nombre }));
    }
    async getDocumentosVigentes(personaId) {
        const documentos = await this.prisma.documentoPersona.findMany({ where: { personaId } });
        return tiposDocumentoVigentes(documentos, new Date());
    }
    async registrarIngreso(dto) {
        const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
        if (!persona) {
            return this.responderNoRegistrada(dto.numeroDocumento, 'ingreso');
        }
        const [documentosRequeridos, documentosVigentes] = await Promise.all([
            persona.puestoId ? this.getDocumentosRequeridos(persona.puestoId) : Promise.resolve([]),
            this.getDocumentosVigentes(persona.id),
        ]);
        const resultado = evaluarIngreso({
            personaActiva: persona.estado === 'activo',
            tienePuesto: persona.puestoId !== null,
            alcoholConforme: dto.alcoholConforme,
            documentosRequeridos,
            documentosVigentes,
        });
        const evento = await this.prisma.eventoAcceso.create({
            data: {
                personaId: persona.id,
                tipoMovimiento: 'ingreso',
                resultado: resultado.autorizado ? 'autorizado' : 'denegado',
                denegadoPorBaja: resultado.denegadoPorBaja,
                denegadoSinPuesto: resultado.denegadoSinPuesto,
                denegadoPorAlcohol: resultado.denegadoPorAlcohol,
                denegadoPorDocumentos: resultado.denegadoPorDocumentos,
                torniqueteId: dto.torniqueteId,
            },
        });
        if (resultado.autorizado) {
            this.eventEmitter.emit('molinete.abrir', {
                torniqueteId: dto.torniqueteId,
                eventoId: evento.id,
                tipoMovimiento: 'ingreso',
            });
        }
        const respuesta = {
            eventoId: evento.id,
            tipoMovimiento: evento.tipoMovimiento,
            resultado: evento.resultado,
            fechaHora: evento.fechaHora.toISOString(),
            persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
            numeroDocumento: persona.numeroDocumento,
            motivos: {
                dadoDeBaja: resultado.denegadoPorBaja,
                sinPuesto: resultado.denegadoSinPuesto,
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
        if (!persona) {
            return this.responderNoRegistrada(dto.numeroDocumento, 'salida');
        }
        const evento = await this.prisma.eventoAcceso.create({
            data: {
                personaId: persona.id,
                tipoMovimiento: 'salida',
                resultado: 'autorizado',
                torniqueteId: dto.torniqueteId,
            },
        });
        this.eventEmitter.emit('molinete.abrir', {
            torniqueteId: dto.torniqueteId,
            eventoId: evento.id,
            tipoMovimiento: 'salida',
        });
        const respuesta = {
            eventoId: evento.id,
            tipoMovimiento: evento.tipoMovimiento,
            resultado: evento.resultado,
            fechaHora: evento.fechaHora.toISOString(),
            persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
            numeroDocumento: persona.numeroDocumento,
            motivos: {},
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