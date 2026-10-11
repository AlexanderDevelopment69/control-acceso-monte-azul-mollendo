"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import type { RolUsuario } from "@/lib/api/types";
import {
  Acciones,
  Captura,
  Condiciones,
  CuentasManual,
  IconoAgregar,
  IconoAlcohol,
  IconoAviso,
  IconoBaja,
  IconoBuscar,
  IconoCalendario,
  IconoCamara,
  IconoCodigo,
  IconoComprimido,
  IconoDni,
  IconoDocumentos,
  IconoEliminar,
  IconoEmpresa,
  IconoGrafico,
  IconoHistorial,
  IconoLlave,
  IconoMolinete,
  IconoPdf,
  IconoRegistrado,
  IconoRele,
  IconoReloj,
  IconoRenovar,
  IconoRostro,
  IconoServidor,
  IconoTabla,
  IconoUsuarios,
  IconoVer,
  Nota,
  PasosTarea,
  RecorridoAcceso,
  Subtitulo,
} from "./Figuras";

interface SeccionManual {
  id: string;
  titulo: string;
  roles: RolUsuario[];
  contenido: React.ReactNode;
}

const SECCIONES: SeccionManual[] = [
  {
    id: "introduccion",
    titulo: "Introducción",
    roles: ["administrador", "vigilancia"],
    contenido: (
      <div className="space-y-3">
        <p>
          Este sistema controla el ingreso y salida de personas al Terminal de Mollendo. Hay dos tipos de cuenta, y
          cada una ve solo las secciones que le corresponden en el menú de la izquierda:
        </p>
        <CuentasManual />
        <p>Así funcionan el ingreso y la salida de cada persona:</p>
        <RecorridoAcceso />
      </div>
    ),
  },
  {
    id: "personal",
    titulo: "Personal y documentos",
    roles: ["administrador"],
    contenido: (
      <div className="space-y-3">
        <p>
          <Link href="/" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Personal y documentos</Link> es
          la pantalla de trabajo: a la izquierda, la lista del personal de todas las empresas; a la derecha, la ficha de
          la persona elegida, con su foto, si puede ingresar y sus documentos.
        </p>
        <Captura
          clave="personal"
          alt="Pantalla Personal y documentos con la ficha de una persona abierta"
          pasos={[
            "Busca por nombre, DNI o empresa.",
            "Filtra quién puede o no puede ingresar hoy.",
            "Elige a una persona para abrir su ficha.",
            <>
              <strong>“+ Nuevo personal”</strong> registra a alguien con su foto y documentos.
            </>,
            "Ve la foto en grande, súbela o cámbiala: la usa el terminal facial para reconocerlo.",
            "Si hoy puede ingresar y, si no, por qué.",
            <>
              Cada documento: <strong>“Ver”</strong> el archivo, <strong>“Renovar”</strong> con la versión nueva o{" "}
              <strong>“Eliminar”</strong>.
            </>,
            <>
              <strong>“+ Agregar documento”</strong> agrega uno que no tenía.
            </>,
          ]}
        />
        <Subtitulo>¿Quién puede ingresar?</Subtitulo>
        <p>Una persona puede ingresar hoy si cumple las tres condiciones:</p>
        <Condiciones
          items={[
            <>
              <strong>No está dada de baja.</strong>
            </>,
            <>
              Tiene <strong>al menos un documento</strong> cargado.
            </>,
            <>
              <strong>Ningún documento está vencido.</strong> Uno que vence hoy sigue válido todo el día.
            </>,
          ]}
        />
        <p>
          En la lista se ve con un <strong>✔</strong> si puede ingresar o un <strong>✖</strong> con el motivo si no. El ✔
          supone que la prueba de alcohol saldrá conforme: el alcohol solo se sabe al momento de ingresar.
        </p>

        <Subtitulo>Registrar a una persona</Subtitulo>
        <p>
          Con <strong>“+ Nuevo personal”</strong> se registra a la persona y sus documentos en un solo formulario:
        </p>
        <PasosTarea
          pasos={[
            {
              Icono: IconoEmpresa,
              titulo: "Empresa",
              texto: (
                <>
                  Elígela de la lista. Si no está, elige <strong>“+ Nueva empresa…”</strong> y escribe su RUC, razón
                  social y correo ahí mismo.
                </>
              ),
            },
            {
              Icono: IconoDni,
              titulo: "Datos de la persona",
              texto: (
                <>
                  Tipo y número de documento, nombres y apellidos. El DNI va con sus <strong>8 dígitos</strong>, sin
                  espacios ni guiones: es el número con el que se identifica en el lector de DNI del molinete.
                </>
              ),
            },
            {
              Icono: IconoCamara,
              titulo: "Foto (obligatoria)",
              texto: (
                <>
                  De frente y con buena luz; JPG, PNG o WEBP de hasta 5 MB. El sistema la envía al terminal facial, que la
                  usa para reconocer a la persona: no hace falta registrar su rostro en el equipo. Se cambia después desde
                  su ficha con <strong>“Cambiar foto”</strong> y el terminal se actualiza solo.
                </>
              ),
            },
            {
              Icono: IconoDocumentos,
              titulo: "Documentos (al menos uno)",
              texto: (
                <>
                  Nombre del documento (p. ej. SCTR), fecha de vencimiento (vacía si no vence) y el archivo: PDF, imagen
                  JPG, PNG o WEBP, o Word, hasta 20 MB. Con <strong>“+ Agregar otro documento”</strong> subes varios a la
                  vez.
                </>
              ),
            },
          ]}
        />
        <Nota>
          Los documentos quedan <strong>válidos desde que se cargan</strong>; no hay que esperar ninguna aprobación. Si un
          documento falla al subirse, la persona ya queda registrada: corrige ese documento y vuelve a guardar.
        </Nota>

        <Subtitulo>Sus documentos</Subtitulo>
        <p>
          En la ficha, la tabla <strong>Documentos</strong> muestra cada documento con su vencimiento y si está vigente o
          vencido. Cada uno tiene estos botones:
        </p>
        <Acciones
          items={[
            {
              Icono: IconoVer,
              boton: "Ver",
              tono: "neutro",
              texto: "Abre el archivo en una pestaña nueva (PDF o imagen); si es Word, se descarga. Las versiones anteriores se ven desde el historial.",
            },
            {
              Icono: IconoRenovar,
              boton: "Renovar",
              texto: "Sube la versión nueva (nuevo vencimiento y archivo). Solo cuenta la más reciente; las anteriores quedan en el historial como “Reemplazado”.",
            },
            {
              Icono: IconoEliminar,
              boton: "Eliminar",
              tono: "peligro",
              texto: "Borra el documento con todas sus versiones (pide confirmación y queda en la auditoría). Si era el único, la persona no podrá ingresar hasta que se le agregue otro.",
            },
            {
              Icono: IconoAgregar,
              boton: "+ Agregar documento",
              tono: "exito",
              texto: "Agrega un documento que no tenía: nombre, vencimiento y archivo.",
            },
          ]}
        />

        <Subtitulo>Dar de baja y reactivar</Subtitulo>
        <Acciones
          items={[
            {
              Icono: IconoBaja,
              boton: "Dar de baja",
              tono: "peligro",
              texto: (
                <>
                  Cuando alguien deja de trabajar en el Terminal. Puedes escribir el <strong>motivo</strong> (opcional) y
                  se confirma en una ventana. Desde ese momento se le deniega el ingreso, sin importar sus documentos
                  (sí puede salir). El motivo y la fecha se ven en su ficha, en la lista y en el reporte de personal.
                </>
              ),
            },
            {
              Icono: IconoRegistrado,
              boton: "Reactivar",
              tono: "exito",
              texto: "Vuelve a quedar habilitado (también con confirmación); sus datos e historial se conservan. Si tiene documentos vencidos, la ventana avisa que aún debe regularizarlos para ingresar.",
            },
          ]}
        />

        <Subtitulo>Buscar y filtrar</Subtitulo>
        <p>
          Busca por nombre, DNI o empresa y filtra por empresa o por quién puede o no puede ingresar. En{" "}
          <strong>No pueden</strong> se separa a quienes no pueden <strong>por documentos</strong> (sin cargar o
          vencidos; podrán ingresar en cuanto se regularicen) de los <strong>dados de baja</strong>. Los números de cada
          pestaña cuentan solo lo que queda con la empresa y la búsqueda elegidas. Con mucho personal, la lista muestra
          las primeras 100 personas y agrega más a medida que bajas.
        </p>
      </div>
    ),
  },
  {
    id: "vigilancia",
    titulo: "Panel de vigilancia",
    roles: ["vigilancia", "administrador"],
    contenido: (
      <div className="space-y-3">
        <p>
          El <Link href="/vigilancia" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Panel de vigilancia</Link> muestra
          en vivo cada ingreso y salida por el molinete apenas ocurre, autorizado o denegado: la fila nueva aparece arriba
          de la tabla (resaltada unos segundos) y los contadores se actualizan solos.
        </p>
        <Captura
          clave="vigilancia"
          alt="Panel de vigilancia con el resumen del día y la lista de ingresos y salidas"
          pasos={[
            "Resumen del día: denegaciones, alcohol no conforme y documentos vencidos.",
            "Busca un ingreso o salida por nombre o DNI.",
            <>
              Elige un día o <strong>“Todos los días”</strong>; <strong>“Hoy”</strong> vuelve al día actual.
            </>,
            "Resultado de cada paso por el molinete: Autorizado o Denegado.",
            "El motivo cuando se deniega.",
          ]}
        />

        <Subtitulo>Cómo se valida un ingreso</Subtitulo>
        <PasosTarea
          pasos={[
            {
              Icono: IconoDni,
              titulo: "Pasa su DNI por el lector",
              texto: (
                <>
                  Si el documento <strong>no está registrado</strong>, la persona está <strong>dada de baja</strong>,{" "}
                  <strong>no tiene documentos</strong> o alguno está <strong>vencido</strong>, se deniega de inmediato y
                  se muestran los motivos.
                </>
              ),
            },
            {
              Icono: IconoRostro,
              titulo: "Muestra su rostro en el terminal facial",
              texto: (
                <>
                  Con los documentos en regla, el sistema habilita en el terminal <strong>solo a esa persona, por 1
                  minuto</strong>: el terminal no acepta el rostro de nadie más.
                </>
              ),
            },
            {
              Icono: IconoAlcohol,
              titulo: "Hace la prueba de alcohol",
              texto: (
                <>
                  Si el rostro y el alcohol son conformes, se abre el molinete y el ingreso queda autorizado. Si el alcohol
                  no es conforme, queda denegado por alcohol; si no se completa en el minuto, queda denegado con{" "}
                  <strong>“No completó rostro y alcohol”</strong>.
                </>
              ),
            },
            {
              Icono: IconoMolinete,
              titulo: "Queda el resultado",
              texto: "La fila pasa a ser el ingreso autorizado o denegado, y se le quita el permiso en el terminal.",
            },
          ]}
        />

        <Subtitulo>Qué significa cada fila</Subtitulo>
        <Acciones
          items={[
            {
              Icono: IconoReloj,
              boton: "En espera",
              comillas: false,
              texto: "Pasó su DNI y tiene su minuto en el terminal facial. Se ve su foto (para compararla con quien está frente al terminal), el tiempo que le queda y una barra que se va vaciando.",
            },
            {
              Icono: IconoUsuarios,
              boton: "En cola",
              tono: "neutro",
              comillas: false,
              texto: "Otra persona está usando el terminal: “Esperando su turno en el terminal facial”. Su minuto empieza cuando termina la anterior (se habilita a una persona a la vez).",
            },
            {
              Icono: IconoRegistrado,
              boton: "Autorizado",
              tono: "exito",
              comillas: false,
              texto: "Pasó todos los controles y se abrió el molinete.",
            },
            {
              Icono: IconoAviso,
              boton: "Denegado",
              tono: "peligro",
              comillas: false,
              texto: (
                <>
                  No se abrió, con el motivo (por ejemplo “No registrado” o “Alcohol”). Si fue por documentos,{" "}
                  <strong>“Documentos ›”</strong> abre una ventana con sus documentos y cuáles debe regularizar.
                </>
              ),
            },
          ]}
        />

        <Subtitulo>Buscar y ver otros días</Subtitulo>
        <p>
          La tabla muestra por defecto los movimientos de <strong>hoy</strong>. Con el calendario se ve otro día o “Todos
          los días”, y “Hoy” vuelve al día actual. El buscador encuentra por nombre, apellido o número de documento en todo
          el historial, no solo en la página visible. La tabla va de 10 en 10, con páginas.
        </p>

        <Subtitulo>La salida</Subtitulo>
        <p>
          Solo exige un DNI registrado, aunque la persona esté dada de baja o tenga documentos vencidos, y abre el
          molinete. No se exige haber marcado un ingreso antes.
        </p>

        <Subtitulo>Avisos</Subtitulo>
        <Acciones
          items={[
            {
              Icono: IconoAviso,
              boton: "Se cae un equipo",
              tono: "peligro",
              comillas: false,
              texto: (
                <>
                  Si falla el controlador, el terminal facial, un lector de DNI o un relé, aparece un aviso rojo arriba
                  de la página con el equipo, qué deja de funcionar y desde cuándo. <strong>Infórmalo al administrador o
                  al soporte técnico.</strong> Desaparece solo cuando el equipo vuelve.
                </>
              ),
            },
            {
              Icono: IconoServidor,
              boton: "El servidor no responde",
              tono: "aviso",
              comillas: false,
              texto: "Aparece un aviso arriba a la derecha: mientras dure, no se valida ningún ingreso.",
            },
          ]}
        />
      </div>
    ),
  },
  {
    id: "dashboard",
    titulo: "Dashboard",
    roles: ["administrador"],
    contenido: (
      <div className="space-y-3">
        <p>
          El <Link href="/dashboard" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Dashboard</Link>{" "}
          resume en indicadores y gráficos lo que pasa en el terminal. Cada ingreso autorizado cuenta como una visita. Se
          actualiza solo con los ingresos y salidas (con mucho movimiento, como máximo cada 10 segundos).
        </p>
        <Captura
          clave="dashboard"
          alt="Dashboard con el periodo elegido, los indicadores y los gráficos"
          pasos={[
            "Elige el periodo: hoy, últimos 7 días, este mes o uno personalizado.",
            "Indicadores del periodo: presentes, visitas finalizadas y total de visitas.",
            "Gráficos de visitas, ingresos y salidas.",
            "Quienes llevan más de un día dentro sin registrar salida.",
          ]}
        />

        <Subtitulo>Los indicadores</Subtitulo>
        <Acciones
          items={[
            {
              Icono: IconoUsuarios,
              boton: "Presentes actualmente",
              comillas: false,
              texto: "Todas las personas que están dentro ahora, sin importar cuándo entraron. Debajo se indica cuántas ingresaron en el periodo y cuántas antes.",
            },
            {
              Icono: IconoRegistrado,
              boton: "Visitas finalizadas",
              tono: "exito",
              comillas: false,
              texto: "Visitas del periodo que ya registraron su salida.",
            },
            {
              Icono: IconoGrafico,
              boton: "Total de visitas",
              comillas: false,
              texto: "Ingresos autorizados en el periodo elegido: las finalizadas más las que siguen presentes.",
            },
            {
              Icono: IconoReloj,
              boton: "Permanencia mayor a 24 h",
              tono: "aviso",
              comillas: false,
              texto: "Personas que ingresaron hace más de un día y no registran salida. Al final de la página está la lista con su tiempo dentro.",
            },
          ]}
        />

        <Subtitulo>Los gráficos</Subtitulo>
        <p>
          Visitas, ingresos y salidas (por día; por semana si el periodo pasa de 2 meses y por mes si pasa de un año),
          motivos de denegación, documentos del personal activo (vigentes, por vencer en 30 días y vencidos) y personal
          activo por empresa.
        </p>
        <Nota>
          Los indicadores de presencia dependen de que cada persona registre su salida en el molinete: si alguien sale sin
          registrarla, seguirá figurando como presente.
        </Nota>
      </div>
    ),
  },
  {
    id: "reportes",
    titulo: "Reportes",
    roles: ["administrador"],
    contenido: (
      <div className="space-y-3">
        <p>
          En <Link href="/reportes" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Reportes</Link> se
          descarga la información del sistema en <strong>Excel</strong> o <strong>PDF</strong>: se elige el reporte, sus
          filtros y el botón de descarga.
        </p>
        <Captura
          clave="reportes"
          alt="Pantalla de Reportes con la lista de reportes, sus filtros y los botones de descarga"
          pasos={[
            "Elige el reporte.",
            "Ajusta sus filtros (empresa, estado o fechas, según el reporte).",
            "En Documentos por persona, marca si el ZIP lleva también los documentos anteriores o las fotos del personal.",
            <>
              <strong>“Descargar Excel”</strong> para trabajarlo en una hoja de cálculo, o “Descargar PDF” para imprimirlo.
            </>,
            <>
              <strong>“Descargar con archivos (ZIP)”</strong>: el Excel con cada archivo (solo en Documentos por persona).
            </>,
          ]}
        />

        <Subtitulo>Los reportes</Subtitulo>
        <Acciones
          items={[
            {
              Icono: IconoUsuarios,
              boton: "Personal y empresas",
              comillas: false,
              texto: "El personal con su empresa, estado y si puede ingresar (con el motivo). Filtros: empresa y activos o dados de baja.",
            },
            {
              Icono: IconoDocumentos,
              boton: "Documentos por persona",
              comillas: false,
              texto: "La última versión de cada documento, con su vencimiento y estado (vigente, por vencer en 30 días o vencido). Filtros: empresa y estado del documento.",
            },
            {
              Icono: IconoMolinete,
              boton: "Ingresos y salidas",
              comillas: false,
              texto: "El historial del periodo con resultado y motivo. Filtros: periodo, movimiento y resultado.",
            },
            {
              Icono: IconoRegistrado,
              boton: "Visitas del periodo",
              comillas: false,
              texto: "Cada ingreso autorizado con su salida, duración y si está finalizada o presente.",
            },
            {
              Icono: IconoReloj,
              boton: "Personal presente",
              comillas: false,
              texto: "Quiénes están dentro en el momento de descargarlo, con su tiempo dentro.",
            },
            {
              Icono: IconoHistorial,
              boton: "Auditoría",
              comillas: false,
              texto: "Quién creó, modificó o eliminó cada dato, en el periodo elegido.",
            },
          ]}
        />

        <Subtitulo>Documentos con sus archivos (ZIP)</Subtitulo>
        <p>En “Documentos por persona” también se pueden bajar los archivos de cada documento:</p>
        <PasosTarea
          pasos={[
            {
              Icono: IconoComprimido,
              titulo: "“Descargar con archivos (ZIP)”",
              texto: "Baja el Excel y cada archivo, en carpetas por empresa y persona. Si quieres, incluye también los documentos anteriores que fueron renovados y las fotos del personal (cada foto en la carpeta de su persona y una columna “Foto” en el Excel).",
            },
            {
              Icono: IconoDocumentos,
              titulo: "Extrae el ZIP",
              texto: "Clic derecho sobre el archivo → “Extraer todo”.",
            },
            {
              Icono: IconoTabla,
              titulo: "Abre el Excel desde la carpeta extraída",
              texto: "El enlace “Abrir” de cada fila abre su archivo.",
            },
          ]}
        />
        <Nota>
          Si se abre el Excel desde dentro del ZIP sin extraerlo, los enlaces “Abrir” no encuentran los archivos.
        </Nota>

        <Subtitulo>Excel o PDF</Subtitulo>
        <Acciones
          items={[
            {
              Icono: IconoTabla,
              boton: "Descargar Excel",
              tono: "exito",
              texto: "Trae filtros en la cabecera y las fechas se pueden ordenar. Hasta 100 000 filas.",
            },
            {
              Icono: IconoPdf,
              boton: "Descargar PDF",
              tono: "peligro",
              texto: "Sale en hoja horizontal, con número de página. Hasta 20 000 filas.",
            },
          ]}
        />
        <p>Si un reporte pide más filas, acota el periodo o los filtros.</p>
      </div>
    ),
  },
  {
    id: "cuenta",
    titulo: "Tu cuenta y contraseña",
    roles: ["administrador", "vigilancia"],
    contenido: (
      <div className="space-y-3">
        <p>Para cambiar tu contraseña:</p>
        <PasosTarea
          pasos={[
            {
              Icono: IconoRegistrado,
              titulo: "Abre tu menú",
              texto: (
                <>
                  Haz clic en tu nombre de usuario, arriba a la derecha, y elige <strong>“Cambiar contraseña”</strong>.
                </>
              ),
            },
            {
              Icono: IconoLlave,
              titulo: "Escribe tu contraseña actual y la nueva",
              texto: "La nueva va dos veces y debe tener al menos 8 caracteres.",
            },
            {
              Icono: IconoHistorial,
              titulo: "Listo",
              texto: "Tu sesión sigue abierta. Si la tenías abierta en otro equipo, allí tendrás que volver a ingresar. El cambio queda registrado en la auditoría.",
            },
          ]}
        />
        <Nota>
          Si olvidaste tu contraseña, no hay recuperación por correo: pide al soporte técnico del sistema que la
          restablezca.
        </Nota>
      </div>
    ),
  },
  {
    id: "auditoria",
    titulo: "Auditoría",
    roles: ["administrador"],
    contenido: (
      <div className="space-y-3">
        <p>
          <Link href="/auditoria" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Auditoría</Link> es
          un registro de solo lectura de quién creó o modificó cada dato del sistema (empresas, personal, documentos,
          usuarios) y cuándo. Sirve para rastrear un cambio o responder “¿quién cargó esto?”.
        </p>
        <Acciones
          items={[
            {
              Icono: IconoBuscar,
              boton: "Buscar",
              comillas: false,
              texto: "Por el correo del usuario o por el tipo de dato (“personal”, “documento”, “empresa”…). Recorre todos los registros, sin importar su antigüedad.",
            },
            {
              Icono: IconoCalendario,
              boton: "Filtrar por fechas",
              comillas: false,
              texto: "Elige “Desde” y “Hasta” para ver solo los cambios de ese periodo.",
            },
          ]}
        />
      </div>
    ),
  },
  {
    id: "sistema-apis",
    titulo: "Sistema y APIs",
    roles: ["administrador"],
    contenido: (
      <div className="space-y-3">
        <p>
          <Link href="/sistema" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Sistema y APIs</Link>{" "}
          muestra el estado del servidor y de los equipos de acceso, la sincronización con el terminal facial y la
          documentación de las APIs. Las etiquetas verdes (“En línea”, “Conectado”) y rojas (“Desconectado”) llevan un punto
          que late: verde, conectado ahora; rojo, caído.
        </p>
        <Captura
          clave="sistema"
          alt="Sistema y APIs con el aviso de fallas arriba y las tarjetas del servidor y de los equipos"
          pasos={[
            "El aviso de fallas: aparece arriba de todas las páginas cuando algo se cae.",
            "Estado del servidor: backend, base de datos, clave de equipos y respaldos.",
            "Estado de los equipos de acceso: controlador, terminal facial, lectores y relés.",
          ]}
        />

        <Subtitulo>Qué muestra cada tarjeta</Subtitulo>
        <Acciones
          items={[
            {
              Icono: IconoServidor,
              boton: "Servidor",
              comillas: false,
              texto: "Si el backend y la base de datos responden, si la clave de equipos está configurada y si los respaldos están al día (el último, con su fecha y tamaño).",
            },
            {
              Icono: IconoMolinete,
              boton: "Controlador",
              comillas: false,
              texto: "El equipo que lee los DNI y abre los molinetes. Si está desconectado, nadie puede ingresar; se puede salir con la lista del personal guardada.",
            },
            {
              Icono: IconoRostro,
              boton: "Terminal facial (G4 Pro)",
              comillas: false,
              texto: "“En línea” o “Desconectado”, con su última actividad y cuántas personas y rostros tiene.",
            },
            {
              Icono: IconoDni,
              boton: "Lectores de DNI",
              comillas: false,
              texto: "Ingreso y salida, con la hora de su última lectura. Se ve el cable de datos, no si el lector tiene energía: si no pita al pasar un DNI, revisa su alimentación.",
            },
            {
              Icono: IconoRele,
              boton: "Relés de molinetes y de aviso",
              comillas: false,
              texto: "Si cada relé está conectado, con su última apertura o aviso.",
            },
            {
              Icono: IconoCodigo,
              boton: "APIs",
              comillas: false,
              texto: "Enlace a la documentación interactiva (Swagger) y la documentación técnica, con ejemplos, de las APIs de los equipos. Pensada para quien los conecte o dé soporte técnico.",
            },
          ]}
        />

        <Subtitulo>Sincronización con el G4 Pro</Subtitulo>
        <p>
          Deja el terminal facial igual al sistema: <strong>borra</strong> del terminal a quien no está registrado (por
          ejemplo, alguien registrado a mano en el equipo), <strong>quita</strong> los permisos de paso que quedaron sueltos
          y <strong>registra con su foto</strong> al personal activo que falte. Nunca hay que registrar personas
          directamente en el terminal: se registran en Personal y documentos y el sistema las envía.
        </p>
        <Captura
          clave="sincronizacion"
          alt="Tarjeta Sincronización con el G4 Pro con el interruptor de revisión diaria, los botones Simular y Sincronizar ahora y el último resultado"
          pasos={[
            <>
              <strong>Revisión diaria</strong>: actívala para que se sincronice sola cada día y elige la hora en el
              selector que aparece. Al activarla pide confirmación.
            </>,
            <>
              <strong>“Simular”</strong>: consulta al terminal y muestra qué cambiaría, <strong>sin cambiar nada</strong>.
            </>,
            <>
              <strong>“Sincronizar ahora”</strong>: aplica los cambios en el terminal (pide confirmación).
            </>,
            "El resultado de la última sincronización, manual o diaria.",
          ]}
        />
        <PasosTarea
          pasos={[
            {
              Icono: IconoBuscar,
              titulo: "Usa primero “Simular”",
              texto: "Mientras consulta al terminal se ve una barra que se desliza arriba de la tarjeta; puede tardar hasta un minuto.",
            },
            {
              Icono: IconoVer,
              titulo: "Revisa el resultado",
              texto: "Cuántas personas agregaría, cuántos usuarios borraría (los que están en el terminal pero no en el sistema) y cuántos permisos quitaría.",
            },
            {
              Icono: IconoRenovar,
              titulo: "Usa “Sincronizar ahora” y confírmalo",
              texto: "El resultado pasa a decir “Agregadas”, “Borrados” y “Permisos quitados”.",
            },
          ]}
        />
        <Nota>
          Si el resultado dice <strong>“equipo(s) no respondieron”</strong>, el terminal facial está desconectado: no se
          pudo revisar ni cambiar nada. Vuelve a intentarlo cuando su tarjeta diga “En línea”. La revisión diaria hace lo
          mismo que “Sincronizar ahora”, sola, a la hora elegida.
        </Nota>

        <Subtitulo>Aviso de fallas</Subtitulo>
        <p>
          Si algo de esta pantalla se cae, aparece un aviso arriba de cualquier página (también para el vigilante): un
          recuadro rojo por equipo con qué falla, qué deja de funcionar y desde cuándo, y un enlace aquí. Se revisa cada 30
          segundos y desaparece solo cuando todo vuelve a estar en línea; con la flecha se contrae hasta que falle algo
          distinto.
        </p>
      </div>
    ),
  },
];

// La sección elegida vive en el "#" de la dirección (/manual#reportes): se puede
// enlazar y el botón Atrás vuelve a la anterior.
function suscribirHash(avisar: () => void) {
  window.addEventListener("hashchange", avisar);
  window.addEventListener("popstate", avisar);
  return () => {
    window.removeEventListener("hashchange", avisar);
    window.removeEventListener("popstate", avisar);
  };
}
const leerHash = () => decodeURIComponent(window.location.hash.slice(1));

function ManualContent() {
  const { user } = useAuth();
  const secciones = SECCIONES.filter((s) => !user || s.roles.includes(user.rol));
  const hash = useSyncExternalStore(suscribirHash, leerHash, () => "");
  const indice = Math.max(0, secciones.findIndex((s) => s.id === hash));
  const activa = secciones[indice];

  // Una sección a la vez: elegir otra la muestra arriba, sin desplazamientos largos.
  function ir(id: string) {
    if (id !== leerHash()) {
      window.history.pushState(null, "", `#${id}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const anterior = secciones[indice - 1];
  const siguiente = secciones[indice + 1];

  return (
    <div>
      <PageHeader title="Manual" description="Guía de uso del sistema, dividida por secciones." />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Índice: fijo debajo de la barra superior en pantallas anchas; en el celular, botones que se deslizan. */}
        <nav className="rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] lg:sticky lg:top-24 lg:w-64 lg:shrink-0 lg:p-4">
          <p className="mb-2 hidden px-1 text-xs font-medium uppercase tracking-wide text-gray-400 lg:block">Secciones</p>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {secciones.map((s) => {
              const actual = s.id === activa?.id;
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => ir(s.id)}
                    aria-current={actual ? "page" : undefined}
                    className={`block w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      actual
                        ? "bg-brand-50 font-medium text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {s.titulo}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {activa && (
          <section key={activa.id} className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">{activa.titulo}</h2>
            <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{activa.contenido}</div>

            {/* Leer en orden */}
            <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              {anterior ? (
                <button
                  type="button"
                  onClick={() => ir(anterior.id)}
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  ← {anterior.titulo}
                </button>
              ) : (
                <span />
              )}
              {siguiente && (
                <button
                  type="button"
                  onClick={() => ir(siguiente.id)}
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {siguiente.titulo} →
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function ManualPage() {
  return (
    <RequireRole roles={["administrador", "vigilancia"]}>
      <ManualContent />
    </RequireRole>
  );
}
