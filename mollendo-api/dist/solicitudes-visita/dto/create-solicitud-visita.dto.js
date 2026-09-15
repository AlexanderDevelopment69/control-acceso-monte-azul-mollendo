var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsDateString, IsInt, IsString, MaxLength } from 'class-validator';
export class CreateSolicitudVisitaDto {
    personaId;
    personaVisitada;
    motivo;
    fechaHoraProgramada;
}
__decorate([
    IsInt(),
    __metadata("design:type", Number)
], CreateSolicitudVisitaDto.prototype, "personaId", void 0);
__decorate([
    IsString(),
    MaxLength(150),
    __metadata("design:type", String)
], CreateSolicitudVisitaDto.prototype, "personaVisitada", void 0);
__decorate([
    IsString(),
    MaxLength(300),
    __metadata("design:type", String)
], CreateSolicitudVisitaDto.prototype, "motivo", void 0);
__decorate([
    IsDateString(),
    __metadata("design:type", String)
], CreateSolicitudVisitaDto.prototype, "fechaHoraProgramada", void 0);
//# sourceMappingURL=create-solicitud-visita.dto.js.map