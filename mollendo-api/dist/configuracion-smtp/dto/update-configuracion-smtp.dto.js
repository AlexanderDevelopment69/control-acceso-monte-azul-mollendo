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
    IsString({ message: 'El host debe ser texto' }),
    IsNotEmpty({ message: 'El host es obligatorio' }),
    MaxLength(200, { message: 'El host no puede tener más de 200 caracteres' }),
    __metadata("design:type", String)
], UpdateConfiguracionSmtpDto.prototype, "host", void 0);
__decorate([
    IsInt({ message: 'El puerto debe ser un número' }),
    Min(1, { message: 'El puerto debe ser mayor a 0' }),
    Max(65535, { message: 'El puerto no puede ser mayor a 65535' }),
    __metadata("design:type", Number)
], UpdateConfiguracionSmtpDto.prototype, "puerto", void 0);
__decorate([
    IsOptional(),
    IsBoolean({ message: 'La conexión segura debe ser sí o no' }),
    __metadata("design:type", Boolean)
], UpdateConfiguracionSmtpDto.prototype, "seguro", void 0);
__decorate([
    Transform(vacioComoIndefinido),
    IsOptional(),
    IsString({ message: 'El usuario debe ser texto' }),
    MaxLength(200, { message: 'El usuario no puede tener más de 200 caracteres' }),
    __metadata("design:type", String)
], UpdateConfiguracionSmtpDto.prototype, "usuario", void 0);
__decorate([
    Transform(vacioComoIndefinido),
    IsOptional(),
    IsString({ message: 'La contraseña debe ser texto' }),
    MaxLength(255, { message: 'La contraseña no puede tener más de 255 caracteres' }),
    __metadata("design:type", String)
], UpdateConfiguracionSmtpDto.prototype, "password", void 0);
__decorate([
    IsString({ message: 'El remitente debe ser texto' }),
    IsNotEmpty({ message: 'El remitente es obligatorio' }),
    IsEmail({}, { message: 'El remitente debe ser un correo válido' }),
    MaxLength(200, { message: 'El remitente no puede tener más de 200 caracteres' }),
    __metadata("design:type", String)
], UpdateConfiguracionSmtpDto.prototype, "remitente", void 0);
//# sourceMappingURL=update-configuracion-smtp.dto.js.map