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
import { IsDateString, IsInt, IsOptional } from 'class-validator';
export class CreateDocumentoDto {
    tipoDocumentoId;
    fechaEmision;
    fechaVencimiento;
}
__decorate([
    Transform(({ value }) => Number(value)),
    IsInt({ message: 'El tipo de documento es obligatorio' }),
    __metadata("design:type", Number)
], CreateDocumentoDto.prototype, "tipoDocumentoId", void 0);
__decorate([
    IsOptional(),
    IsDateString({}, { message: 'La fecha de emisión no es válida' }),
    __metadata("design:type", String)
], CreateDocumentoDto.prototype, "fechaEmision", void 0);
__decorate([
    IsOptional(),
    IsDateString({}, { message: 'La fecha de vencimiento no es válida' }),
    __metadata("design:type", String)
], CreateDocumentoDto.prototype, "fechaVencimiento", void 0);
//# sourceMappingURL=create-documento.dto.js.map