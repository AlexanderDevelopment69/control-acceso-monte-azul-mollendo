# Revisión del portal (11/10/2026)

Revisión de cómo está programado el portal (sesión, navegación, permisos, pantallas y canal en vivo) a raíz de un hallazgo: con la sesión abierta se podía volver a la pantalla de inicio de sesión. Se encontraron seis problemas más; todos están corregidos.

| # | Problema | Impacto | Corrección |
|---|---|---|---|
| 0 | Con la sesión abierta se podía volver a `/iniciar-sesion` | Bajo | El login redirige a `/` (que lleva a cada perfil a su pantalla) y no muestra el formulario mientras lee la sesión |
| 1 | El canal en vivo se conectaba con el token del momento de abrir la página (dura 1 hora). Si después se cortaba (internet, reinicio de la API en una actualización), al reconectar presentaba el token vencido, el servidor lo rechazaba y no se volvía a intentar. El Panel de vigilancia, sin recarga de respaldo, dejaba de mostrar ingresos y esperas sin avisar | **Alto** | `lib/ws.ts`: el token se lee en cada conexión; si el servidor corta o rechaza, se renueva la sesión y se reconecta (esperas de 2 s a 30 s); al reconectar, la pantalla recarga lo perdido. El Panel se pone al día además cada minuto |
| 2 | Al volver al portal después de más de 1 hora (pestaña cerrada), el token vencido hacía borrar toda la sesión aunque la renovación (7 días) siguiera válida | Medio | `AuthContext`: un token solo vencido se renueva al abrir el portal; si el servidor no responde, se reintenta cada 5 s sin cerrar la sesión. Además, un error del servidor al renovar (p. ej. reinicio) ya no se toma como sesión cerrada (`refreshAccessToken` / `renovarSesion`) |
| 3 | Se podía cargar o renovar un documento con vencimiento ya pasado: quedaba vencido al instante y la persona no podía ingresar | Medio | El calendario no permite fechas pasadas, el formulario lo valida y la API lo rechaza (400). Vence hoy sí vale. Solo el script de datos de demostración envía `permitirVencido=true` |
| 4 | Las ventanas se podían cerrar (Esc o ✕) mientras guardaban: la operación seguía sin que se viera su resultado | Bajo | `Modal` con `bloqueado`: mientras se guarda no se cierra y "Cancelar" queda desactivado (nuevo personal, agregar/renovar documento, dar de baja, eliminar, cambiar contraseña) |
| 5 | Errores sin aviso o sin reintento: la ficha mostraba el error sin "Reintentar"; si fallaba la actualización de la lista tras un cambio, no se avisaba | Bajo | "Reintentar" en la ficha; la lista muestra el error con su "Reintentar" |
| 6 | Un usuario dado de baja seguía recibiendo el panel en vivo hasta recargar | Bajo | El canal comprueba la cuenta al conectarse y el servidor corta las conexiones del usuario al darlo de baja o cambiar su contraseña |

## Comprobado

- API: 91 pruebas.
- En vivo contra la API local:
  - documento con vencimiento 2020-01-01 → 400 con el mensaje;
  - canal con token vencido → cortado por el servidor; con token vigente → conectado;
  - dar de baja una cuenta de vigilancia con su panel conectado → canal cortado al instante y reconexión rechazada (la cuenta se reactivó después);
  - el canal real del portal (`lib/ws.ts`), arrancando con un token vencido: a los 2 s renovó la sesión, se reconectó y pidió recargar los datos.

## Revisado sin problemas

- Permisos por pantalla (un vigilante que abre `/dashboard` o `/sistema` va a su panel) y en la API.
- Cierre de sesión en una pestaña: las demás vuelven al inicio de sesión en su siguiente acción.
- Cambio de contraseña: la sesión actual sigue, las demás se cierran.
- Reportes: "desde" no puede ser posterior a "hasta" (portal y API).
- Botones desactivados mientras se guarda (sin envíos dobles).
- La página 404 lleva al inicio.
