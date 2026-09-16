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
export class CreatePuestoDto {
    nombre;
    caso;
}
__decorate([
    IsString(),
    IsNotEmpty({ message: 'El nombre es obligatorio' }),
    MaxLength(100),
    __metadata("design:type", String)
], CreatePuestoDto.prototype, "nombre", void 0);
__decorate([
    IsIn(['visita', 'personal_propio', 'contratista', 'tercero']),
    __metadata("design:type", String)
], CreatePuestoDto.prototype, "caso", void 0);
//# sourceMappingURL=create-puesto.dto.js.map