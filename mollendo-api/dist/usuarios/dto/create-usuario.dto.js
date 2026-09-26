var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateUsuarioDto {
    correo;
    rol;
    password;
}
__decorate([
    IsEmail({}, { message: 'Ingrese un correo válido' }),
    MaxLength(150, { message: 'El correo no puede tener más de 150 caracteres' }),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "correo", void 0);
__decorate([
    IsIn(['administrador', 'vigilancia'], { message: 'El rol debe ser "administrador" o "vigilancia"' }),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "rol", void 0);
__decorate([
    IsString({ message: 'La contraseña debe ser texto' }),
    MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "password", void 0);
//# sourceMappingURL=create-usuario.dto.js.map