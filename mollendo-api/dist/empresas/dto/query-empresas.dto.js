var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsIn, IsOptional, IsString } from 'class-validator';
export class QueryEmpresasDto {
    estado;
    busqueda;
}
__decorate([
    IsOptional(),
    IsIn(['activa', 'inactiva'], { message: 'El estado debe ser "activa" o "inactiva"' }),
    __metadata("design:type", String)
], QueryEmpresasDto.prototype, "estado", void 0);
__decorate([
    IsOptional(),
    IsString({ message: 'La búsqueda debe ser texto' }),
    __metadata("design:type", String)
], QueryEmpresasDto.prototype, "busqueda", void 0);
//# sourceMappingURL=query-empresas.dto.js.map