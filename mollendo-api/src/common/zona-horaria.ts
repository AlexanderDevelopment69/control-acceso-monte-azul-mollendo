// Fija la zona horaria del proceso antes de que se use cualquier fecha. La
// vigencia de los documentos ("vence hoy") y los contadores "de hoy" del panel
// dependen del día local: sin esto, en un equipo o contenedor en UTC un
// documento que vence hoy pasaría a vencido desde las 19:00 hora de Perú.
// Se importa primero en main.ts. Para usar otra zona, definir ZONA_HORARIA como
// variable de entorno del sistema (el .env se carga después y no la afecta).
process.env.TZ = process.env.ZONA_HORARIA ?? 'America/Lima';
