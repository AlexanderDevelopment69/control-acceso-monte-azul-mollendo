var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
export class SalidaDto {
    tipoDocumentoIdentidad;
    numeroDocumento;
    torniqueteId;
}
__decorate([
    IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' }),
    __metadata("design:type", String)
], SalidaDto.prototype, "tipoDocumentoIdentidad", void 0);
__decorate([
    IsString({ message: 'El número de documento debe ser texto' }),
    IsNotEmpty({ message: 'El número de documento es obligatorio' }),
    __metadata("design:type", String)
], SalidaDto.prototype, "numeroDocumento", void 0);
__decorate([
    IsOptional(),
    IsString({ message: 'El ID del torniquete debe ser texto' }),
    MaxLength(50, { message: 'El ID del torniquete no puede tener más de 50 caracteres' }),
    __metadata("design:type", String)
], SalidaDto.prototype, "torniqueteId", void 0);
//# sourceMappingURL=salida.dto.js.map