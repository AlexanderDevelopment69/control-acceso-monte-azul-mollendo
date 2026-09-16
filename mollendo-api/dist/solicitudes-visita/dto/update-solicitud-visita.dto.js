var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsDateString, IsIn, IsOptional } from 'class-validator';
export class UpdateSolicitudVisitaDto {
    fechaHoraProgramada;
    estado;
}
__decorate([
    IsOptional(),
    IsDateString({}, { message: 'La fecha y hora programada no es válida' }),
    __metadata("design:type", String)
], UpdateSolicitudVisitaDto.prototype, "fechaHoraProgramada", void 0);
__decorate([
    IsOptional(),
    IsIn(['programada', 'completada', 'cancelada'], {
        message: 'El estado debe ser "programada", "completada" o "cancelada"',
    }),
    __metadata("design:type", String)
], UpdateSolicitudVisitaDto.prototype, "estado", void 0);
//# sourceMappingURL=update-solicitud-visita.dto.js.map