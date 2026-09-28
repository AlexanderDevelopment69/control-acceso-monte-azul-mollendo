var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
export class CambiarPasswordDto {
    passwordActual;
    passwordNueva;
}
__decorate([
    IsString({ message: 'La contraseña actual debe ser texto' }),
    IsNotEmpty({ message: 'La contraseña actual es obligatoria' }),
    __metadata("design:type", String)
], CambiarPasswordDto.prototype, "passwordActual", void 0);
__decorate([
    IsString({ message: 'La contraseña nueva debe ser texto' }),
    MinLength(8, { message: 'La contraseña nueva debe tener al menos 8 caracteres' }),
    __metadata("design:type", String)
], CambiarPasswordDto.prototype, "passwordNueva", void 0);
//# sourceMappingURL=cambiar-password.dto.js.map