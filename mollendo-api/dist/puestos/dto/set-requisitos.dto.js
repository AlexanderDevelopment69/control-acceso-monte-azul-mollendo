var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInt, ValidateNested } from 'class-validator';
class RequisitoItemDto {
    tipoDocumentoId;
    obligatorio;
}
__decorate([
    IsInt({ message: 'El tipo de documento debe ser válido' }),
    __metadata("design:type", Number)
], RequisitoItemDto.prototype, "tipoDocumentoId", void 0);
__decorate([
    IsBoolean({ message: 'El campo obligatorio debe ser sí o no' }),
    __metadata("design:type", Boolean)
], RequisitoItemDto.prototype, "obligatorio", void 0);
export class SetRequisitosDto {
    requisitos;
}
__decorate([
    IsArray({ message: 'Los requisitos deben ser una lista' }),
    ArrayMinSize(0),
    ValidateNested({ each: true }),
    Type(() => RequisitoItemDto),
    __metadata("design:type", Array)
], SetRequisitosDto.prototype, "requisitos", void 0);
//# sourceMappingURL=set-requisitos.dto.js.map