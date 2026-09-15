var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreatePersonaDto {
    puestoId;
    tipoDocumentoIdentidad;
    numeroDocumento;
    nombres;
    apellidos;
    area;
}
__decorate([
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreatePersonaDto.prototype, "puestoId", void 0);
__decorate([
    IsIn(['DNI', 'CE', 'PASAPORTE']),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "tipoDocumentoIdentidad", void 0);
__decorate([
    IsString(),
    MaxLength(20),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "numeroDocumento", void 0);
__decorate([
    IsString(),
    MaxLength(150),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "nombres", void 0);
__decorate([
    IsString(),
    MaxLength(150),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "apellidos", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "area", void 0);
//# sourceMappingURL=create-persona.dto.js.map