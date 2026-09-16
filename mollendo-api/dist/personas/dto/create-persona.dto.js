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
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
const vacioComoIndefinido = ({ value }) => (value === '' ? undefined : value);
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
    IsInt({ message: 'El puesto debe ser válido' }),
    __metadata("design:type", Number)
], CreatePersonaDto.prototype, "puestoId", void 0);
__decorate([
    IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' }),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "tipoDocumentoIdentidad", void 0);
__decorate([
    IsString({ message: 'El número de documento debe ser texto' }),
    IsNotEmpty({ message: 'El número de documento es obligatorio' }),
    MaxLength(20, { message: 'El número de documento no puede tener más de 20 caracteres' }),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "numeroDocumento", void 0);
__decorate([
    IsString({ message: 'Los nombres deben ser texto' }),
    IsNotEmpty({ message: 'Los nombres son obligatorios' }),
    MaxLength(150, { message: 'Los nombres no pueden tener más de 150 caracteres' }),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "nombres", void 0);
__decorate([
    IsString({ message: 'Los apellidos deben ser texto' }),
    IsNotEmpty({ message: 'Los apellidos son obligatorios' }),
    MaxLength(150, { message: 'Los apellidos no pueden tener más de 150 caracteres' }),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "apellidos", void 0);
__decorate([
    Transform(vacioComoIndefinido),
    IsOptional(),
    IsString({ message: 'El área debe ser texto' }),
    MaxLength(100, { message: 'El área no puede tener más de 100 caracteres' }),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "area", void 0);
//# sourceMappingURL=create-persona.dto.js.map