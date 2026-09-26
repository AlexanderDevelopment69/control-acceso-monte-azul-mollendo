export function evaluarIngreso(input) {
    if (!input.personaActiva) {
        return {
            autorizado: false,
            denegadoPorBaja: true,
            denegadoSinPuesto: false,
            denegadoPorAlcohol: false,
            denegadoPorDocumentos: false,
            documentosFaltantes: [],
        };
    }
    const denegadoSinPuesto = !input.tienePuesto;
    const documentosFaltantes = input.documentosRequeridos
        .filter((doc) => !input.documentosVigentes.has(doc.tipoDocumentoId))
        .map((doc) => doc.nombre);
    const denegadoPorAlcohol = !input.alcoholConforme;
    const denegadoPorDocumentos = documentosFaltantes.length > 0;
    return {
        autorizado: !denegadoSinPuesto && !denegadoPorAlcohol && !denegadoPorDocumentos,
        denegadoPorBaja: false,
        denegadoSinPuesto,
        denegadoPorAlcohol,
        denegadoPorDocumentos,
        documentosFaltantes,
    };
}
export function ultimasVersiones(documentos) {
    const ultimas = new Map();
    for (const doc of documentos) {
        const actual = ultimas.get(doc.tipoDocumentoId);
        if (!actual || doc.version > actual.version) {
            ultimas.set(doc.tipoDocumentoId, doc);
        }
    }
    return ultimas;
}
export function tiposDocumentoVigentes(documentos, hoy) {
    const vigentes = new Set();
    for (const [tipoDocumentoId, doc] of ultimasVersiones(documentos)) {
        if (esDocumentoVigente(doc.fechaVencimiento, hoy)) {
            vigentes.add(tipoDocumentoId);
        }
    }
    return vigentes;
}
export function esDocumentoVigente(fechaVencimiento, hoy) {
    if (!fechaVencimiento) {
        return true;
    }
    const inicioDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    return fechaVencimiento.getTime() >= inicioDeHoy;
}
//# sourceMappingURL=validacion-acceso.engine.js.map