var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';
export class QueryEventosAccesoDto {
    personaId;
    resultado;
    desde;
    hasta;
}
__decorate([
    IsOptional(),
    Transform(({ value }) => Number(value)),
    IsInt(),
    __metadata("design:type", Number)
], QueryEventosAccesoDto.prototype, "personaId", void 0);
__decorate([
    IsOptional(),
    IsIn(['autorizado', 'denegado']),
    __metadata("design:type", String)
], QueryEventosAccesoDto.prototype, "resultado", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], QueryEventosAccesoDto.prototype, "desde", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], QueryEventosAccesoDto.prototype, "hasta", void 0);
//# sourceMappingURL=query-eventos-acceso.dto.js.map