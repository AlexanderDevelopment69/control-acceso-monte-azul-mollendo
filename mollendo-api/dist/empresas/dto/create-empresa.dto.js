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
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
const vacioComoIndefinido = ({ value }) => (value === '' ? undefined : value);
export class CreateEmpresaDto {
    ruc;
    razonSocial;
    correoContacto;
    telefonoContacto;
}
__decorate([
    IsString({ message: 'El RUC debe ser texto' }),
    Length(11, 11, { message: 'El RUC debe tener 11 dígitos' }),
    __metadata("design:type", String)
], CreateEmpresaDto.prototype, "ruc", void 0);
__decorate([
    IsString({ message: 'La razón social debe ser texto' }),
    IsNotEmpty({ message: 'La razón social es obligatoria' }),
    MaxLength(200, { message: 'La razón social no puede tener más de 200 caracteres' }),
    __metadata("design:type", String)
], CreateEmpresaDto.prototype, "razonSocial", void 0);
__decorate([
    IsEmail({}, { message: 'Ingrese un correo válido' }),
    __metadata("design:type", String)
], CreateEmpresaDto.prototype, "correoContacto", void 0);
__decorate([
    Transform(vacioComoIndefinido),
    IsOptional(),
    IsString({ message: 'El teléfono debe ser texto' }),
    MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' }),
    __metadata("design:type", String)
], CreateEmpresaDto.prototype, "telefonoContacto", void 0);
//# sourceMappingURL=create-empresa.dto.js.map