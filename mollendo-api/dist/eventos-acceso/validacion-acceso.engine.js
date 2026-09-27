export function evaluarIngreso(input) {
    if (!input.personaActiva) {
        return {
            autorizado: false,
            denegadoPorBaja: true,
            denegadoSinDocumentos: false,
            denegadoPorAlcohol: false,
            denegadoPorDocumentos: false,
            documentosVencidos: [],
        };
    }
    const denegadoSinDocumentos = input.documentos.length === 0;
    const documentosVencidos = input.documentos.filter((d) => !d.vigente).map((d) => d.nombre);
    const denegadoPorDocumentos = documentosVencidos.length > 0;
    const denegadoPorAlcohol = !input.alcoholConforme;
    return {
        autorizado: !denegadoSinDocumentos && !denegadoPorDocumentos && !denegadoPorAlcohol,
        denegadoPorBaja: false,
        denegadoSinDocumentos,
        denegadoPorAlcohol,
        denegadoPorDocumentos,
        documentosVencidos,
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
export function documentosActuales(documentos, hoy) {
    return [...ultimasVersiones(documentos).values()]
        .map((doc) => ({
        tipoDocumentoId: doc.tipoDocumentoId,
        nombre: doc.tipoDocumento.nombre,
        vigente: esDocumentoVigente(doc.fechaVencimiento, hoy),
    }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
}
export function esDocumentoVigente(fechaVencimiento, hoy) {
    if (!fechaVencimiento) {
        return true;
    }
    const inicioDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    return fechaVencimiento.getTime() >= inicioDeHoy;
}
//# sourceMappingURL=validacion-acceso.engine.js.map