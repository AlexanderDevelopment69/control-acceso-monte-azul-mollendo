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
import { IsIn, IsInt, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { normalizarNumeroDocumento, recortar } from '../../common/transformaciones.js';
export class CreatePersonaDto {
    empresaId;
    tipoDocumentoIdentidad;
    numeroDocumento;
    nombres;
    apellidos;
}
__decorate([
    IsInt({ message: 'La empresa es obligatoria' }),
    __metadata("design:type", Number)
], CreatePersonaDto.prototype, "empresaId", void 0);
__decorate([
    IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' }),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "tipoDocumentoIdentidad", void 0);
__decorate([
    Transform(normalizarNumeroDocumento),
    IsString({ message: 'El número de documento debe ser texto' }),
    IsNotEmpty({ message: 'El número de documento es obligatorio' }),
    Matches(/^[A-Z0-9]+$/, { message: 'El número de documento solo puede tener letras y números' }),
    MaxLength(20, { message: 'El número de documento no puede tener más de 20 caracteres' }),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "numeroDocumento", void 0);
__decorate([
    Transform(recortar),
    IsString({ message: 'Los nombres deben ser texto' }),
    IsNotEmpty({ message: 'Los nombres son obligatorios' }),
    MaxLength(150, { message: 'Los nombres no pueden tener más de 150 caracteres' }),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "nombres", void 0);
__decorate([
    Transform(recortar),
    IsString({ message: 'Los apellidos deben ser texto' }),
    IsNotEmpty({ message: 'Los apellidos son obligatorios' }),
    MaxLength(150, { message: 'Los apellidos no pueden tener más de 150 caracteres' }),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "apellidos", void 0);
//# sourceMappingURL=create-persona.dto.js.map