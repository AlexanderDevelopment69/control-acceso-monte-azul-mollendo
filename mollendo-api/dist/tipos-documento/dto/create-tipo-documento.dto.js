var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateTipoDocumentoDto {
    nombre;
    tipoValidacion;
}
__decorate([
    IsString({ message: 'El nombre debe ser texto' }),
    IsNotEmpty({ message: 'El nombre es obligatorio' }),
    MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' }),
    __metadata("design:type", String)
], CreateTipoDocumentoDto.prototype, "nombre", void 0);
__decorate([
    IsIn(['fecha_vencimiento', 'si_no', 'vigente_por_actividad'], {
        message: 'El tipo de validación debe ser "fecha_vencimiento", "si_no" o "vigente_por_actividad"',
    }),
    __metadata("design:type", String)
], CreateTipoDocumentoDto.prototype, "tipoValidacion", void 0);
//# sourceMappingURL=create-tipo-documento.dto.js.map