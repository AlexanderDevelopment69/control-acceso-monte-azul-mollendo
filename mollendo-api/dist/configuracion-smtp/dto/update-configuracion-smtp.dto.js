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
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
const vacioComoIndefinido = ({ value }) => (value === '' ? undefined : value);
export class UpdateConfiguracionSmtpDto {
    host;
    puerto;
    seguro;
    usuario;
    password;
    remitente;
}
__decorate([
    IsString(),
    IsNotEmpty({ message: 'El host es obligatorio' }),
    MaxLength(200),
    __metadata("design:type", String)
], UpdateConfiguracionSmtpDto.prototype, "host", void 0);
__decorate([
    IsInt({ message: 'El puerto debe ser un número' }),
    Min(1),
    Max(65535),
    __metadata("design:type", Number)
], UpdateConfiguracionSmtpDto.prototype, "puerto", void 0);
__decorate([
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateConfiguracionSmtpDto.prototype, "seguro", void 0);
__decorate([
    Transform(vacioComoIndefinido),
    IsOptional(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], UpdateConfiguracionSmtpDto.prototype, "usuario", void 0);
__decorate([
    Transform(vacioComoIndefinido),
    IsOptional(),
    IsString(),
    MaxLength(255),
    __metadata("design:type", String)
], UpdateConfiguracionSmtpDto.prototype, "password", void 0);
__decorate([
    IsString(),
    IsNotEmpty({ message: 'El remitente es obligatorio' }),
    IsEmail({}, { message: 'El remitente debe ser un correo válido' }),
    MaxLength(200),
    __metadata("design:type", String)
], UpdateConfiguracionSmtpDto.prototype, "remitente", void 0);
//# sourceMappingURL=update-configuracion-smtp.dto.js.map