export function evaluarIngreso(input) {
    if (!input.personaActiva) {
        return {
            autorizado: false,
            denegadoPorBaja: true,
            denegadoPorAlcohol: false,
            denegadoPorDocumentos: false,
            documentosFaltantes: [],
        };
    }
    const documentosFaltantes = input.documentosRequeridos
        .filter((doc) => !input.documentosVigentesAprobados.has(doc.tipoDocumentoId))
        .map((doc) => doc.nombre);
    const denegadoPorAlcohol = !input.alcoholConforme;
    const denegadoPorDocumentos = documentosFaltantes.length > 0;
    return {
        autorizado: !denegadoPorAlcohol && !denegadoPorDocumentos,
        denegadoPorBaja: false,
        denegadoPorAlcohol,
        denegadoPorDocumentos,
        documentosFaltantes,
    };
}
export function evaluarSalida(ultimoMovimientoAutorizado) {
    const autorizado = ultimoMovimientoAutorizado === 'ingreso';
    return { autorizado, denegadoSinIngresoPrevio: !autorizado };
}
//# sourceMappingURL=validacion-acceso.engine.js.map