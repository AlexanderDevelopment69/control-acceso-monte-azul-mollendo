export const normalizarNumeroDocumento = ({ value }) => typeof value === 'string' ? value.replace(/\s+/g, '').toUpperCase() : value;
export const recortar = ({ value }) => (typeof value === 'string' ? value.trim() : value);
//# sourceMappingURL=transformaciones.js.map