var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TiposDocumentoController } from './tipos-documento.controller.js';
import { TiposDocumentoService } from './tipos-documento.service.js';
let TiposDocumentoModule = class TiposDocumentoModule {
};
TiposDocumentoModule = __decorate([
    Module({
        controllers: [TiposDocumentoController],
        providers: [TiposDocumentoService],
        exports: [TiposDocumentoService],
    })
], TiposDocumentoModule);
export { TiposDocumentoModule };
//# sourceMappingURL=tipos-documento.module.js.map