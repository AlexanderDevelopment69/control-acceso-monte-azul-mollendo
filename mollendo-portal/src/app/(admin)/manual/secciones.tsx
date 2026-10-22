import React from "react";
import type { RolUsuario } from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import { CuentasManual, RecorridoAcceso } from "./Figuras";
import { Lista, Motivo, type PantallaManual } from "./Recorrido";

/** Texto del manual: cada sección con su título, para qué perfiles es y sus pantallas con números. */
export interface SeccionManual {
  id: string;
  titulo: string;
  descripcion: string;
  roles: RolUsuario[];
  pantallas: PantallaManual[];
}

export const SECCIONES: SeccionManual[] = [
  {
    id: "introduccion",
    titulo: "Introducción",
    descripcion: "Qué hace el sistema, quién lo usa y cómo entra y sale una persona.",
    roles: ["administrador", "vigilancia"],
    pantallas: [
      {
        titulo: "Las cuentas",
        descripcion: "Quién usa el sistema",
        contenido: (
          <>
            <p className="mb-3">
              Este sistema controla el ingreso y salida de personas al Terminal de Mollendo. Hay dos tipos de cuenta y cada una ve en el
              menú solo las secciones que le corresponden:
            </p>
            <CuentasManual />
          </>
        ),
      },
      {
        titulo: "Entrar y salir",
        descripcion: "Los pasos en el molinete",
        contenido: (
          <>
            <p className="mb-3">Así funcionan el ingreso y la salida de cada persona:</p>
            <RecorridoAcceso />
          </>
        ),
      },
    ],
  },
  {
    id: "personal",
    titulo: "Personal y documentos",
    descripcion: "Registre al personal, su foto y sus documentos, y revise quién puede ingresar.",
    roles: ["administrador"],
    pantallas: [
      {
        titulo: "La pantalla",
        descripcion: "La lista y la ficha",
        clave: "personal",
        puntos: [
          {
            titulo: "Buscar",
            texto: (
              <p>
                Escriba un nombre, DNI o empresa. Con mucho personal, la lista muestra las primeras 100 personas y agrega más a medida que
                baja.
              </p>
            ),
          },
          {
            titulo: "Filtrar por perfil y empresa",
            texto: (
              <p>
                Con un perfil elegido, la lista de empresas muestra solo las que tienen personal de ese perfil, con cuántos. Los números de
                cada pestaña cuentan solo lo que queda con los filtros y la búsqueda elegidos.
              </p>
            ),
          },
          {
            titulo: "¿Puede ingresar hoy?",
            texto: (
              <>
                <p>Separa a quienes pueden ingresar de quienes no. En <b>No pueden</b> se distingue:</p>
                <Lista>
                  <li>
                    <b>Por documentos:</b> sin cargar o vencidos. Podrán ingresar en cuanto se regularicen.
                  </li>
                  <li>
                    <b>Dados de baja.</b>
                  </li>
                </Lista>
              </>
            ),
          },
          {
            titulo: "Elegir a una persona",
            texto: (
              <>
                <p>Abre su ficha a la derecha. En la lista se ve un ✔ si puede ingresar o un ✖ con el motivo si no.</p>
                <p>
                  El ✔ supone que la prueba de alcohol saldrá bien: el alcohol solo se sabe al momento de ingresar.
                </p>
              </>
            ),
          },
          {
            titulo: "Carga masiva",
            texto: (
              <p>
                Registre a muchas personas a la vez desde un Excel. Se explica paso a paso en las pantallas <b>Carga masiva</b> y{" "}
                <b>Revisar el Excel</b>.
              </p>
            ),
          },
          {
            titulo: "+ Nuevo personal",
            texto: (
              <p>
                Registra a una persona con su foto y sus documentos. Se explica campo por campo en la pantalla <b>Nuevo personal</b>.
              </p>
            ),
          },
          {
            titulo: "La foto",
            texto: (
              <>
                <p>Tóquela para verla en grande. <b>Subir foto</b> o <b>Cambiar foto</b> la reemplaza.</p>
                <p>
                  La usa el terminal facial para reconocer a la persona: el sistema se la envía solo, no hace falta registrar el rostro en
                  el equipo.
                </p>
              </>
            ),
          },
          {
            titulo: "Perfil y Editar datos",
            texto: (
              <>
                <p>
                  Junto al nombre se ve su <b>perfil</b>. <b>Editar datos</b> corrige el perfil, la empresa, el tipo y número de documento, los
                  nombres y los apellidos. El DNI va con 8 dígitos y no puede repetirse. Queda en la Auditoría.
                </p>
                <p>
                  Si cambia el <b>número de documento</b>, desde que guarde la persona debe pasar su documento nuevo por el lector. El
                  terminal facial se actualiza solo; los ingresos anteriores conservan el documento con el que se registraron.
                </p>
              </>
            ),
          },
          {
            titulo: "Si puede ingresar hoy",
            texto: (
              <>
                <p>Puede ingresar si cumple las cuatro condiciones:</p>
                <Lista>
                  <li>No está dada de baja.</li>
                  <li>Hoy está dentro de su período de autorización, si tiene uno.</li>
                  <li>Tiene al menos un documento cargado.</li>
                  <li>Ningún documento está vencido. Uno que vence hoy sigue válido todo el día.</li>
                </Lista>
                <p>Si no puede, aquí dice por qué.</p>
              </>
            ),
          },
          {
            titulo: "Sus documentos",
            texto: (
              <>
                <p>Cada documento con su vencimiento y si está vigente o vencido:</p>
                <Lista>
                  <li>
                    <b>Ver:</b> abre el archivo (PDF o imagen); si es Word, se descarga.
                  </li>
                  <li>
                    <b>Renovar:</b> sube la versión nueva con su vencimiento. Solo cuenta la más reciente; las anteriores quedan en el
                    historial como <b>Reemplazado</b>.
                  </li>
                  <li>
                    <b>Eliminar:</b> borra el documento con todas sus versiones (pide confirmación). Si era el único, la persona no podrá
                    ingresar hasta que se le agregue otro.
                  </li>
                </Lista>
              </>
            ),
          },
          {
            titulo: "+ Agregar documento",
            texto: (
              <p>
                Agrega uno que no tenía: nombre, vencimiento y archivo. Queda <b>válido desde que se carga</b>; no hay que esperar ninguna
                aprobación.
              </p>
            ),
          },
          {
            titulo: "Período de autorización",
            texto: (
              <p>
                Fechas y motivo de la autorización. <b>Guardar período</b> aplica los cambios y <b>Quitar período</b> lo borra. Queda
                en la Auditoría.
              </p>
            ),
          },
          {
            titulo: "Dar de baja y reactivar",
            texto: (
              <>
                <p>
                  <b>Dar de baja</b> cuando alguien deja de trabajar en el Terminal. Pide escribir el motivo (obligatorio) y se confirma.
                  Desde ese momento no puede ingresar, sin importar sus documentos; sí puede salir. El motivo y la fecha se ven en su ficha,
                  en la lista y en el reporte de personal.
                </p>
                <p>
                  <b>Reactivar</b> lo vuelve a habilitar, con sus datos e historial. Pide escribir el motivo, que queda en la Auditoría. Si
                  tiene documentos vencidos, la ventana avisa que aún debe regularizarlos.
                </p>
              </>
            ),
          },
        ],
      },
      {
        titulo: "Nuevo personal",
        descripcion: "Registrar a una persona",
        clave: "nuevo-personal",
        puntos: [
          {
            titulo: "Perfil",
            texto: (
              <p>
                Personal de planta, contratista, subcontratista / proveedor, conductor, visita o cliente / mayorista. Solo clasifica a la
                persona (lista, Dashboard y reportes): el molinete valida a todos igual.
              </p>
            ),
          },
          {
            titulo: "Empresa",
            texto: (
              <p>
                Con el perfil elegido, arriba salen las empresas que ya tienen personal de ese perfil (con cuántos) y después las demás.
              </p>
            ),
          },
          {
            titulo: "¿No está la empresa?",
            texto: (
              <p>
                El enlace abre <b>Empresas</b> en otra pestaña para registrarla, sin perder lo que ya escribió. Al volver, la lista se
                actualiza sola.
              </p>
            ),
          },
          {
            titulo: "Documento, nombres y apellidos",
            texto: (
              <p>
                El DNI va con sus <b>8 dígitos</b>, sin espacios ni guiones: es el número con el que se identifica en el lector del molinete.
                También acepta CE y pasaporte.
              </p>
            ),
          },
          {
            titulo: "Foto del personal (obligatoria)",
            texto: (
              <p>
                De frente y con buena luz; JPG, PNG o WEBP de hasta 5 MB. El sistema la envía al terminal facial. Se cambia después desde la
                ficha y el terminal se actualiza solo.
              </p>
            ),
          },
          {
            titulo: "Período de autorización (opcional)",
            texto: (
              <p>
                Fecha de ingreso, fecha de finalización y motivo. Si lo usa, van los tres; fuera de esas fechas la persona <b>no podrá
                ingresar</b>. Vacío, no tiene límite de fechas.
              </p>
            ),
          },
          {
            titulo: "Documentos (al menos uno)",
            texto: (
              <p>
                Nombre (elegido de la lista: SCTR, CAMO o la inducción SSMA), fecha de vencimiento y archivo. La fecha va <b>vacía si no vence</b> y no puede ser una fecha ya
                pasada. Archivo PDF, imagen (JPG, PNG o WEBP) o Word, de hasta 20 MB.
              </p>
            ),
          },
          {
            titulo: "+ Agregar otro documento",
            texto: <p>Para subir varios documentos a la vez.</p>,
          },
          {
            titulo: "Registrar",
            texto: (
              <>
                <p>Guarda a la persona con su foto y sus documentos. Desde ese momento puede ingresar.</p>
                <p>
                  Si un documento falla al subirse, la persona ya queda registrada: corrija ese documento y presione{" "}
                  <b>Subir documentos pendientes</b>.
                </p>
              </>
            ),
          },
        ],
      },
      {
        titulo: "Carga masiva",
        descripcion: "Muchas personas desde un Excel",
        clave: "carga-masiva",
        puntos: [
          {
            titulo: "Los pasos",
            texto: (
              <>
                <p>Descargue la plantilla, llénela con una fila por persona y súbala. El sistema revisa todo antes de guardar.</p>
                <p>
                  Registra <b>los datos de la persona, sin foto ni documentos</b>: para que pueda ingresar, agréguelos después en su ficha.
                </p>
              </>
            ),
          },
          {
            titulo: "Descargar plantilla",
            texto: (
              <>
                <p>
                  Un Excel con las columnas Perfil, Empresa, Tipo de documento, Número de documento, Nombres y Apellidos. Perfil, empresa y
                  tipo de documento se eligen de listas; la hoja <b>Instrucciones</b> explica cada columna.
                </p>
                <p>
                  Tiene además tres columnas opcionales para el período de autorización: Fecha de ingreso, Fecha de finalización (DD/MM/AAAA)
                  y Motivo de la autorización. Si llena una, van las tres.
                </p>
                <p>
                  La empresa también se puede escribir por su RUC. Si no está, regístrela primero en <b>Empresas</b> y vuelva a descargar la
                  plantilla: la carga masiva no crea empresas.
                </p>
              </>
            ),
          },
          {
            titulo: "Elegir el Excel",
            texto: <p>Archivo .xlsx de hasta 5 MB y 2000 personas.</p>,
          },
          {
            titulo: "Revisar archivo",
            texto: (
              <p>
                Revisa todas las filas <b>sin guardar nada</b> y muestra el resultado (siguiente pantalla).
              </p>
            ),
          },
        ],
      },
      {
        titulo: "Revisar el Excel",
        descripcion: "Antes de registrar",
        clave: "carga-revision",
        puntos: [
          {
            titulo: "El archivo tiene errores",
            texto: (
              <p>
                Si <b>alguna fila tiene error, no se registra a nadie</b>. Corrija el Excel y vuelva a subirlo con <b>Elegir otro archivo</b>.
              </p>
            ),
          },
          {
            titulo: "Cada fila, en su grupo",
            texto: (
              <>
                <Lista>
                  <li>
                    <Badge color="success">Lista</Badge> se registrará.
                  </li>
                  <li>
                    <b>Ya registrada:</b> ese documento ya existe en el sistema; se omite.
                  </li>
                  <li>
                    <Badge color="error">Con error</Badge> tiene algo que corregir.
                  </li>
                </Lista>
                <p>Si hay errores, la revisión se abre directo en <b>Con error</b>.</p>
              </>
            ),
          },
          {
            titulo: "El motivo",
            texto: (
              <p>
                Debajo de cada fila con error, qué corregir. Por ejemplo, <b>El DNI debe tener 8 dígitos</b> o <b>La empresa no está registrada en el
                sistema</b>.
              </p>
            ),
          },
          {
            titulo: "Descargar filas con error",
            texto: (
              <p>
                Baja la misma plantilla solo con esas filas, una columna <b>Motivo</b> y <b>la celda de cada error pintada de rojo</b>. Corríjalas y
                suba ese archivo.
              </p>
            ),
          },
          {
            titulo: "Registrar",
            texto: (
              <p>
                Mientras haya errores dice <b>Corrija las filas con error</b> y no se puede presionar. Sin errores, dice{" "}
                <b>Registrar N personas</b> y guarda las filas listas.
              </p>
            ),
          },
        ],
      },
    ],
  },
  {
    id: "empresas",
    titulo: "Empresas",
    descripcion: "Registre las empresas del personal, corrija sus datos y actívelas o desactívelas.",
    roles: ["administrador"],
    pantallas: [
      {
        titulo: "Empresas",
        descripcion: "La lista de empresas",
        clave: "empresas",
        puntos: [
          {
            titulo: "Buscar",
            texto: <p>Por razón social o RUC, sin importar tildes. La tabla va de 10 en 10, con páginas.</p>,
          },
          {
            titulo: "Filtrar por estado",
            texto: <p>Todas, Activas o Inactivas.</p>,
          },
          {
            titulo: "Personal activo",
            texto: <p>Cuántas personas activas tiene cada empresa.</p>,
          },
          {
            titulo: "Editar, desactivar o eliminar",
            texto: (
              <>
                <p>
                  <b>Editar</b> corrige el RUC, la razón social, el correo o el teléfono. Su personal no cambia.
                </p>
                <p>
                  <b>Desactivar</b>: la empresa ya no aparece al registrar personal ni en la plantilla de la carga masiva. Su personal{" "}
                  <b>no se da de baja</b>: si tiene sus documentos al día, sigue pudiendo ingresar. Por eso el sistema avisa cuántas personas
                  activas tiene; si ya no deben entrar, delas de baja en Personal y documentos. <b>Activar</b> la vuelve a mostrar.
                </p>
                <p>
                  <b>Eliminar</b> aparece solo en empresas <b>sin ninguna persona</b> (ni dada de baja) y sin usuarios del portal, por
                  ejemplo una registrada por error. Pide confirmación y se borra definitivamente.
                </p>
                <p>Todo cambio queda en la Auditoría.</p>
              </>
            ),
          },
          {
            titulo: "+ Nueva empresa",
            texto: (
              <p>
                RUC (11 dígitos, sin repetirse), razón social, correo de contacto y teléfono (opcional). Desde ese momento se puede elegir al
                registrar personal y aparece en la plantilla de la carga masiva. Las empresas se registran solo aquí.
              </p>
            ),
          },
        ],
      },
    ],
  },
  {
    id: "vigilancia",
    titulo: "Panel de vigilancia",
    descripcion: "Vea en vivo quién entra y sale, por qué alguien no pasó y qué hacer si falla un equipo.",
    roles: ["vigilancia", "administrador"],
    pantallas: [
      {
        titulo: "El panel",
        descripcion: "Lo que se ve todos los días",
        clave: "vigilancia",
        puntos: [
          {
            titulo: "Resumen del día",
            texto: (
              <>
                <p>
                  Cuántos no pudieron pasar hoy, cuántos dieron alcohol positivo y cuántos tienen documentos vencidos. Cada ingreso o salida
                  aparece arriba de la tabla apenas ocurre, resaltado unos segundos.
                </p>
                <p className="font-medium text-gray-800 dark:text-white/90">Avisos que pueden aparecer arriba:</p>
                <Lista>
                  <li>
                    <b>Rojo:</b> se cayó un equipo (dice cuál, qué deja de funcionar y desde cuándo). Avise a soporte; desaparece solo
                    cuando vuelve.
                  </li>
                  <li>
                    <b>El servidor no responde:</b> mientras dure, no se valida ningún ingreso.
                  </li>
                </Lista>
                <p>
                  <b>Sin internet</b> no se puede ingresar; la salida sigue con la lista guardada en el controlador y se registra cuando
                  vuelve la conexión. El panel se reconecta solo: no hace falta recargar.
                </p>
              </>
            ),
          },
          {
            titulo: "Buscar",
            texto: <p>Escriba un nombre, apellido o DNI. Busca en todo el historial, no solo en lo que se ve.</p>,
          },
          {
            titulo: "Elegir el día",
            texto: (
              <p>
                Por defecto se ve <b>hoy</b>. Con el calendario se elige otro día o <b>Todos los días</b>; <b>Hoy</b> vuelve al día actual. La tabla va de 10
                en 10.
              </p>
            ),
          },
          {
            titulo: "¿Pasó o no pasó?",
            texto: (
              <>
                <ul className="space-y-2">
                  <li>
                    <Badge color="success">Autorizado</Badge> pasó todos los controles y se abrió el molinete.
                  </li>
                  <li>
                    <Badge color="error">Denegado</Badge> no se abrió: al lado está el motivo.
                  </li>
                  <li>
                    <Badge color="primary">En espera</Badge> pasó su DNI y tiene <b>1 minuto</b> para hacer rostro y alcohol en el equipo
                    facial (orden DNI → Facial + Alcohol).
                  </li>
                  <li>
                    <Badge color="success">Pase su DNI</Badge> aprobó rostro y alcohol y tiene <b>30 segundos</b> para pasar su DNI (orden
                    <b>facial primero</b>). Se ve su foto.
                  </li>
                </ul>
                <p className="mt-3">
                  <b>Para salir</b> solo pasa su DNI por el lector de salida. Debe tener un ingreso registrado antes; puede salir aunque esté
                  dado de baja o con documentos vencidos.
                </p>
                <p>Junto al nombre se ven su foto y su perfil: contratista, conductor, visita…</p>
              </>
            ),
          },
          {
            titulo: "Por qué no pasó y qué hacer",
            texto: (
              <>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  <Motivo m="No registrado" hacer="Su DNI no está en el sistema. No puede entrar hasta que el administrador lo registre." />
                  <Motivo m="Dado de baja" hacer="No puede entrar. Solo el administrador puede reactivarlo." />
                  <Motivo m="Sin documentos ›" hacer="No tiene documentos registrados. El administrador debe subirlos." />
                  <Motivo m="Documentos ›" hacer="Tiene un documento vencido. Tóquelo para ver cuál; el administrador sube el nuevo." />
                  <Motivo
                    m="Fuera del período autorizado"
                    hacer={
                      <>
                        Su período de autorización no incluye hoy. El administrador puede cambiarlo en la ficha, en{" "}
                        <b>Período de autorización</b>.
                      </>
                    }
                  />
                  <Motivo
                    m="Alcohol"
                    hacer="Dio positivo en la prueba de alcohol. No puede entrar. Queda con su nombre aunque no haya pasado su DNI."
                  />
                  <Motivo m="Rostro no coincide" hacer="En la verificación manual se indicó que no es la persona del DNI. No puede entrar." />
                  <Motivo
                    m="No completó rostro y alcohol"
                    hacer="No terminó en 1 minuto (o, en verificación manual, nadie decidió en 2). Puede pasar su DNI otra vez."
                  />
                  <Motivo
                    m="DNI antes del facial"
                    hacer={<>En <b>facial primero</b>, pasó su DNI sin haber hecho antes rostro y alcohol. Debe empezar por el terminal facial.</>}
                  />
                  <Motivo
                    m="No pasó su DNI a tiempo"
                    hacer={<>En <b>facial primero</b>, aprobó rostro y alcohol, pero no pasó su DNI en los 30 segundos. Debe empezar otra vez.</>}
                  />
                  <Motivo
                    m="No es quien sopló"
                    hacer={<>En <b>facial primero</b>, la prueba de rostro y alcohol la hizo otra persona. No puede entrar con esa prueba.</>}
                  />
                  <Motivo m="Ya figura dentro" hacer="Figura que ya entró y no marcó su salida." />
                  <Motivo m="No registra ingreso" hacer="Quiere salir, pero no figura que haya entrado." />
                </ul>
                <p className="mb-2">
                  <b>Marcas junto al motivo:</b> <Badge color="warning">Tarjeta de contingencia</Badge>,{" "}
                  <Badge color="warning">Sin lector de DNI: identificado por rostro</Badge>, <Badge color="warning">Salida sin lector</Badge> y{" "}
                  <Badge color="primary">Manual</Badge> (con el grado y quién decidió).
                </p>
                <p>
                  <b>Aviso ámbar No completó:</b> si dice que no pudo soplar, revise si arriba dice <b>Alcoholímetro desconectado</b>{" "}
                  y avise a soporte. Si el cambio va a demorar, use su botón <b>Activar verificación manual</b>. Se cierra con la ✕ o solo,
                  cuando la siguiente persona entra bien.
                </p>
              </>
            ),
          },
        ],
      },
      {
        titulo: "Sin DNI: tarjeta de contingencia",
        descripcion: "Si el personal olvidó su DNI o el lector no lo reconoce",
        contenido: (
          <>
            <p className="mb-3">
              El administrador imprime la <b>tarjeta de contingencia</b> (un QR) y se la entrega al vigilante. La tarjeta sola no abre: se usa
              en lugar del DNI del personal.
            </p>
            <p className="mb-2 font-medium text-gray-800 dark:text-white/90">Para entrar:</p>
            <Lista>
              <li>El personal avisa al vigilante <b>antes</b> de hacer rostro y alcohol.</li>
              <li>
                Hace rostro y alcohol. En el panel aparece <Badge color="success">Pase su DNI</Badge> con su nombre y su foto.
              </li>
              <li>
                En esos <b>30 segundos</b>, el vigilante pasa la tarjeta por el lector de ingreso. Se abre el molinete y queda a nombre del
                personal, con la marca <Badge color="warning">Tarjeta de contingencia</Badge>.
              </li>
            </Lista>
            <p className="my-3">
              Si en ese momento hay dos personas esperando su DNI, la tarjeta no sabe a quién dejar pasar y no abre: espere a que pase la
              otra y que el personal repita rostro y alcohol.
            </p>
            <p className="mb-2 font-medium text-gray-800 dark:text-white/90">Para salir:</p>
            <Lista>
              <li>
                En el panel, toque <b>Salida sin DNI</b>, busque al personal y toque <b>Elegir</b>. Solo aparecen quienes figuran dentro.
              </li>
              <li>
                Arriba queda una franja ámbar con su nombre: tiene <b>2 minutos</b> para pasar la tarjeta por el lector de salida.
              </li>
            </Lista>
            <p className="my-3">
              La tarjeta pasada en otro momento <b>no abre</b>, suena el aviso y queda anotada. Cada uso, aceptado o no, lo ve el administrador
              en <b>Contingencias → Tarjetas de contingencia</b>.
            </p>
            <p>
              <b>Administrador:</b> ahí mismo crea la tarjeta (<b>No vence</b> o hasta un día), la imprime, la desactiva o la elimina (solo si nunca se usó). Si se pierde o se copia,
              use <b>Cambiar código</b>: la impresa queda anulada y debe imprimirse de nuevo. Solo el administrador las ve y las
              administra en el portal.
            </p>
          </>
        ),
      },
      {
        titulo: "Si falla un lector de DNI",
        descripcion: "Contingencia sin lector: se activa sola",
        contenido: (
          <>
            <p className="mb-3">
              Si se desconecta un lector, el sistema lo detecta solo y muestra una franja roja en el Panel. No hay que activar nada.
            </p>
            <Lista>
              <li>
                <b>Lector de ingreso:</b> el ingreso es solo con rostro y alcohol, sin pasar el DNI (con el orden Facial + Alcohol → DNI).
                Queda marcado <Badge color="warning">Sin lector de DNI: identificado por rostro</Badge>.
              </li>
              <li>
                <b>Lector de salida:</b> toque <b>Ir a Presentes ahora</b>, busque a la persona y toque <b>Salida</b>; confirme con{" "}
                <b>Abrir salida</b>. Queda marcado <Badge color="warning">Salida sin lector</Badge>, con su usuario. Mientras tanto, <b>Salida
                sin DNI</b> no se puede usar.
              </li>
            </Lista>
            <p className="mt-3">
              Cuando el lector vuelve, todo regresa solo a la normalidad. Avise a soporte para que lo revise o lo cambie.
            </p>
          </>
        ),
      },
      {
        titulo: "Si falla el equipo facial o el alcoholímetro",
        descripcion: "Cómo pasar a verificación manual",
        clave: "verificacion-activar",
        puntos: [
          {
            titulo: "El aviso rojo",
            texto: (
              <p>
                Si el equipo facial deja de responder unos 20 segundos, aparece <b>Terminal facial… Desconectado</b>; si se desconecta el
                alcoholímetro, <b>Alcoholímetro (DT1700)… Desconectado</b>. Nadie puede completar rostro y alcohol. Si el alcoholímetro
                está conectado pero no mide, no hay aviso rojo: la persona no puede soplar y aparece el aviso ámbar <b>No completó</b>.
              </p>
            ),
          },
          {
            titulo: "Activar verificación manual",
            texto: (
              <>
                <p>
                  El botón está en el aviso rojo y en el aviso ámbar <b>No completó</b>. Tóquelo, escriba el motivo y presione{" "}
                  <b>Activar</b>. Desde ahí <b>usted</b> revisa el rostro y toma la prueba de alcohol a todos. El DNI y los documentos se
                  revisan igual que siempre; las salidas no cambian.
                </p>
                <p>
                  Arriba del panel queda una <b>franja azul</b> con desde cuándo, quién la activó y el motivo, y el botón{" "}
                  <b>Volver a modo normal</b>.
                </p>
                <p>
                  Cuando vuelve el equipo facial o el alcoholímetro, el panel pregunta en verde: <b>¿Volver a modo normal?</b>. Si aún no
                  funciona bien, elija <b>Seguir en manual</b>. Si la activó desde el aviso ámbar, termínela con{" "}
                  <b>Volver a modo normal</b> cuando el alcoholímetro mida de nuevo. No vuelve sola, a propósito, para que siempre sepa en
                  qué modo está.
                </p>
                <p>
                  La activan y terminan el vigilante o el administrador. No tiene tiempo máximo. Activarla, terminarla y cada decisión quedan
                  registradas con quién lo hizo.
                </p>
              </>
            ),
          },
        ],
      },
      {
        titulo: "Verificación manual",
        descripcion: "La ventana que aparece con cada persona",
        clave: "verificacion-ventana",
        puntos: [
          {
            titulo: "Tiempo para decidir",
            texto: (
              <>
                <p>
                  Tiene <b>2 minutos</b>. Si nadie decide, el ingreso se deniega solo y pasa la siguiente persona; puede volver a pasar su
                  DNI.
                </p>
                <p>Si llegan varias, se atienden de una en una, en el orden en que pasaron el DNI.</p>
              </>
            ),
          },
          {
            titulo: "Documentos ya revisados",
            texto: (
              <p>
                El sistema ya revisó su DNI y sus documentos: están en regla. Si no lo estaban, se denegó de inmediato y no aparece esta
                ventana.
              </p>
            ),
          },
          {
            titulo: "Qué hacer antes de decidir",
            texto: (
              <p>
                Compare su rostro con la foto (si no tiene foto, con su DNI) y tómele la prueba con el alcoholímetro de repuesto, a todos sin
                excepción. Escriba el grado que marca.
              </p>
            ),
          },
          {
            titulo: "Registrar prueba",
            texto: (
              <p>
                Bajo el límite, se abre el molinete y queda marcado como <b>Manual</b> con el grado y su nombre, en la tabla y en el reporte. Igual
                o sobre el límite, no se abre, suena el aviso y queda como <b>Alcohol</b>. Si otro vigilante decidió antes, vale la primera
                decisión y su ventana se cierra.
              </p>
            ),
          },
          {
            titulo: "Sin número",
            texto: (
              <p>
                Si el alcoholímetro de repuesto no muestra el número, toque <b>Mi alcoholímetro no muestra el número</b> y elija lo que
                marcó: <b>Marcó apto</b> abre; <b>Marcó alcohol</b> no abre. Queda registrado que fue sin número.
              </p>
            ),
          },
          {
            titulo: "No es la persona",
            texto: <p>El rostro no es el de la foto. No se abre, suena el aviso y queda como <b>Rostro no coincide</b>.</p>,
          },
        ],
      },
    ],
  },
  {
    id: "presentes",
    titulo: "Presentes ahora",
    descripcion: "Quiénes están dentro del terminal en este momento.",
    roles: ["administrador", "vigilancia"],
    pantallas: [
      {
        titulo: "Presentes ahora",
        descripcion: "Quiénes están dentro",
        clave: "presentes",
        puntos: [
          {
            titulo: "Buscar",
            texto: (
              <p>
                Por nombre, DNI o empresa. Útil, por ejemplo, en una evacuación. Se actualiza sola con cada ingreso o salida. El
                administrador regresa con <b>‹ Dashboard</b>.
              </p>
            ),
          },
          { titulo: "Filtrar por perfil", texto: <p>Muestra solo las personas de ese perfil.</p> },
          {
            titulo: "Descargar Excel",
            texto: <p>El reporte <b>Personal presente</b>, con el perfil elegido (solo el administrador).</p>,
          },
          {
            titulo: "Tiempo dentro",
            texto: (
              <p>
                De mayor a menor tiempo dentro; en naranja, más de 12 horas.
              </p>
            ),
          },
          { titulo: "Páginas", texto: <p>De 10 en 10.</p> },
          {
            titulo: "Salida",
            texto: (
              <p>
                Solo aparece si el lector de salida está desconectado: abre la salida de esa persona (ver <b>Si falla un lector de DNI</b>, en
                Panel de vigilancia).
              </p>
            ),
          },
        ],
      },
    ],
  },
  {
    // Solo para el vigilante: el administrador tiene la sección completa más arriba.
    id: "personal-consulta",
    titulo: "Personal y documentos",
    descripcion: "Consulte quién puede ingresar hoy y por qué.",
    roles: ["vigilancia"],
    pantallas: [
      {
        titulo: "Personal y documentos (solo consulta)",
        descripcion: "Quién puede ingresar y por qué",
        contenido: (
          <p>
            Busque a una persona para ver si puede ingresar hoy y por qué: sus documentos con su vencimiento, su período de autorización y
            si está dada de baja. Para cambiar algo, avise al administrador.
          </p>
        ),
      },
    ],
  },
  {
    id: "dashboard",
    titulo: "Dashboard",
    descripcion: "Indicadores y gráficos de lo que pasa en el terminal, y quiénes están dentro ahora.",
    roles: ["administrador"],
    pantallas: [
      {
        titulo: "Dashboard",
        descripcion: "Indicadores y gráficos",
        clave: "dashboard",
        puntos: [
          {
            titulo: "El periodo",
            texto: (
              <p>
                Hoy, últimos 7 días, este mes o uno personalizado. Todo se actualiza solo con cada ingreso y salida (con mucho movimiento,
                como máximo cada 10 segundos).
              </p>
            ),
          },
          {
            titulo: "Los indicadores",
            texto: (
              <Lista>
                <li>
                  <b>Presentes actualmente:</b> todos los que están dentro ahora, sin importar cuándo entraron. Al tocarla se abre <b>Presentes
                  ahora</b> (siguiente pantalla).
                </li>
                <li>
                  <b>Ingresos finalizados:</b> ingresos del periodo que ya registraron su salida.
                </li>
                <li>
                  <b>Total de ingresos:</b> los finalizados más los que siguen presentes.
                </li>
              </Lista>
            ),
          },
          {
            titulo: "Los gráficos",
            texto: (
              <>
                <p>
                  Ingresos presentes y finalizados; ingresos y salidas (por día, por semana si el periodo pasa de 2 meses y por mes si pasa
                  de un año); motivos de denegación; documentos del personal activo (vigentes, por vencer en 30 días y vencidos); personal
                  activo por empresa e ingresos por perfil.
                </p>
                <p>
                  <b>Horas-hombre por empresa:</b> las horas que su personal estuvo dentro, de cada ingreso a su salida. Solo cuentan los
                  ingresos <b>con su salida por el molinete</b>; una corrección manual no suma. El detalle está en el reporte <b>Horas-hombre</b>.
                </p>
              </>
            ),
          },
          {
            titulo: "Permanencia mayor a 12 h",
            texto: (
              <>
                <p>Quienes ingresaron hace más de 12 horas y no registran salida. Al final de la página está la lista con su tiempo dentro.</p>
                <p>
                  Tras una emergencia con los brazos del molinete liberados, quienes salieron así siguen figurando dentro hasta que el
                  vigilante registre su salida manual.
                </p>
              </>
            ),
          },
        ],
      },
    ],
  },
  {
    id: "reportes",
    titulo: "Reportes",
    descripcion: "Descargue la información del sistema en Excel o PDF.",
    roles: ["administrador"],
    pantallas: [
      {
        titulo: "Reportes",
        descripcion: "Elegir y descargar",
        clave: "reportes",
        puntos: [
          {
            titulo: "Elija el reporte",
            texto: (
              <Lista>
                <li>
                  <b>Personal y empresas:</b> empresa, perfil, estado, si puede ingresar (con el motivo) y el período autorizado.
                </li>
                <li>
                  <b>Documentos por persona:</b> la última versión de cada documento, con su vencimiento y estado.
                </li>
                <li>
                  <b>Ingresos y salidas:</b> el historial con resultado, motivo y verificación (manual o corrección manual).
                </li>
                <li>
                  <b>Ingresos del periodo:</b> cada ingreso con su salida, duración y si sigue presente.
                </li>
                <li>
                  <b>Horas-hombre:</b> por empresa y, en otra hoja, por persona (61:01 = 61 horas y 1 minuto).
                </li>
                <li>
                  <b>Personal presente:</b> quiénes están dentro al descargarlo.
                </li>
                <li>
                  <b>Empresas por perfil:</b> cuántas personas activas tiene cada empresa de cada perfil.
                </li>
                <li>
                  <b>Auditoría:</b> quién creó, modificó o eliminó cada dato.
                </li>
              </Lista>
            ),
          },
          {
            titulo: "Filtros",
            texto: <p>Empresa, perfil, estado o fechas, según el reporte.</p>,
          },
          {
            titulo: "Qué incluye el ZIP",
            texto: (
              <p>
                Solo en Documentos por persona: marque si lleva también los documentos anteriores (los renovados) y las fotos del personal.
              </p>
            ),
          },
          {
            titulo: "Excel o PDF",
            texto: (
              <Lista>
                <li>
                  <b>Excel:</b> con filtros en la cabecera, fechas que se pueden ordenar y una hoja <b>Leyenda</b> que explica cada columna. Hasta
                  100 000 filas.
                </li>
                <li>
                  <b>PDF:</b> en hoja horizontal, con número de página y la leyenda al final. Hasta 20 000 filas.
                </li>
                <li>Si pide más filas, acote el periodo o los filtros.</li>
              </Lista>
            ),
          },
          {
            titulo: "Descargar con archivos (ZIP)",
            texto: (
              <>
                <p>El Excel con cada archivo, en carpetas por empresa y persona.</p>
                <p>
                  <b>Extraiga el ZIP</b> (clic derecho → <b>Extraer todo</b>) y abra el Excel desde la carpeta extraída: el enlace <b>Abrir</b> de cada
                  fila abre su archivo. Desde dentro del ZIP, sin extraer, los enlaces no funcionan.
                </p>
              </>
            ),
          },
        ],
      },
    ],
  },
  {
    id: "auditoria",
    titulo: "Auditoría",
    descripcion: "Quién hizo cada cambio o acción en el sistema y cuándo, y cuándo se desconectó un equipo. Solo se puede ver.",
    roles: ["administrador"],
    pantallas: [
      {
        titulo: "Auditoría",
        descripcion: "El registro de cambios",
        clave: "auditoria",
        puntos: [
          {
            titulo: "Buscar",
            texto: (
              <p>
                Por el correo del usuario, por el tipo de dato (<b>personal</b>, <b>documento</b>, <b>empresa</b>…) o por lo que dice el registro,
                como el nombre o el DNI de una persona. Recorre todos los registros, sin importar su antigüedad.
              </p>
            ),
          },
          {
            titulo: "Filtrar por fechas",
            texto: <p><b>Desde</b> y <b>Hasta</b> muestran solo ese periodo. <b>Todas las fechas</b> quita el filtro. La tabla va de 10 en 10.</p>,
          },
          {
            titulo: "Dato y registro",
            texto: (
              <p>
                Sobre qué fue (empresa, personal, documento, usuario, molinete, reporte, salida sin DNI…) y el detalle de lo que se hizo.
              </p>
            ),
          },
          {
            titulo: "Acción",
            texto: (
              <p>
                Qué se hizo: crear, modificar o eliminar un dato, abrir el molinete sin DNI, sincronizar con el equipo facial, descargar un
                reporte o abrir el archivo de un documento. Sirve para responder <b>¿quién hizo esto?</b>.
              </p>
            ),
          },
          {
            titulo: "Desconexiones de equipos",
            texto: (
              <p>
                Cada vez que un equipo se desconecta y cuando vuelve queda una fila a nombre de <b>Sistema</b>, con cuánto tiempo estuvo sin
                conexión: equipo facial, alcoholímetro, Controlador (PC), lectores de DNI, relés, base de datos y respaldos. Búsquelas con <b>equipos</b>.
              </p>
            ),
          },
        ],
      },
    ],
  },
  {
    id: "sistema-apis",
    titulo: "Sistema y APIs",
    descripcion: "Estado del servidor y de los equipos de acceso, y sincronización con el terminal facial.",
    roles: ["administrador"],
    pantallas: [
      {
        titulo: "Estado",
        descripcion: "Servidor y equipos",
        clave: "sistema",
        puntos: [
          {
            titulo: "Aviso de fallas",
            texto: (
              <>
                <p>
                  Si algo se cae, aparece arriba de cualquier página (también para el vigilante): un recuadro rojo por equipo con qué falla,
                  qué deja de funcionar y desde cuándo.
                </p>
                <p>
                  Aparece y desaparece en el momento en que un equipo se cae o vuelve, junto con las tarjetas de esta pantalla. Con la flecha
                  se contrae hasta que falle algo distinto.
                </p>
              </>
            ),
          },
          {
            titulo: "Servidor",
            texto: (
              <p>
                Si el backend y la base de datos responden, si la clave de equipos está configurada y si los respaldos están al día (el
                último, con su fecha y tamaño). Verde con punto que late: conectado; rojo: caído.
              </p>
            ),
          },
          {
            titulo: "Equipos de acceso",
            texto: (
              <Lista>
                <li>
                  <b>Controlador:</b> lee los DNI y abre los molinetes. Desconectado, nadie puede ingresar; se sale con la lista guardada.
                </li>
                <li>
                  <b>Terminal facial (G4 Pro):</b> en línea o no, su última actividad y cuántas personas y rostros tiene.
                </li>
                <li>
                  <b>Alcoholímetro (DT1700):</b> conectado o no al terminal facial; se revisa cada 10 segundos. Desconectado, nadie puede
                  ingresar.
                </li>
                <li>
                  <b>Lectores de DNI:</b> ingreso y salida, con su última lectura. Si no pita al pasar un DNI, revise su alimentación. Si dice
                  <b>Adaptador sin respuesta</b>, desconecte y vuelva a conectar el adaptador USB de ese lector en la mini PC.
                </li>
                <li>
                  <b>Relés:</b> de molinetes y de aviso, con su última apertura o aviso.
                </li>
                <li>
                  <b>APIs:</b> la documentación para quien conecte los equipos o dé soporte técnico.
                </li>
              </Lista>
            ),
          },
        ],
      },
      {
        titulo: "Sincronización",
        descripcion: "Con el terminal facial",
        clave: "sincronizacion",
        puntos: [
          {
            titulo: "Revisión diaria",
            texto: (
              <>
                <p>
                  Actívela para que se sincronice sola cada día y elija la hora. Pide confirmación. Encendida muestra <b>Activo</b>, desde cuándo y
                  quién la cambió.
                </p>
                <p>
                  Sincronizar deja el terminal igual al sistema: borra a quien no está registrado, registra con su foto al personal activo que
                  falte y corrige los datos cambiados a mano en el terminal (contraseña, administrador, tarjeta o nombre), sin tocar el
                  rostro. Nunca registre personas directamente en el terminal.
                </p>
              </>
            ),
          },
          {
            titulo: "Simular",
            texto: (
              <p>
                Consulta al terminal y muestra qué cambiaría, <b>sin cambiar nada</b>. Puede tardar hasta un minuto. Si no hay nada que cambiar,
                dice <b>Todo en orden</b>.
              </p>
            ),
          },
          {
            titulo: "Sincronizar ahora",
            texto: <p>Aplica los cambios en el terminal (pide confirmación). Use primero <b>Simular</b>.</p>,
          },
          {
            titulo: "Última sincronización",
            texto: (
              <p>
                Cuántas personas se agregaron, cuántos usuarios se borraron, cuántos permisos se quitaron (solo con el terminal en modo
                control de acceso; en asistencia siempre es 0) y a cuántas personas se les
                corrigieron datos cambiados a mano en el terminal (contraseña, administrador, tarjeta o nombre; el rostro no cambia). Si
                dice{" "}
                <b>equipo(s) no respondieron</b>, el terminal está desconectado: inténtelo cuando diga <b>En línea</b>.
              </p>
            ),
          },
        ],
      },
      {
        titulo: "Orden del ingreso",
        descripcion: "Qué va primero: el DNI o el facial",
        contenido: (
          <>
            <p className="mb-3">
              En <b>Sistema y APIs</b>, la tarjeta <b>Orden del ingreso</b> tiene dos interruptores; rige uno solo (al encender uno, el otro se
              apaga). Cambiar de orden pide confirmación y muestra los pasos del orden nuevo; el que rige dice <b>Activo</b>, desde cuándo y quién
              lo activó:
            </p>
            <Lista>
              <li>
                <b>DNI → Facial + Alcohol → Molinete:</b> primero el DNI por el lector de ingreso; si está en regla, la persona hace rostro y
                alcohol en el terminal facial y se abre el molinete.
              </li>
              <li>
                <b>Facial + Alcohol → DNI → Molinete:</b> primero rostro y alcohol en el terminal facial; cuando el terminal dice
                <b>correcto</b>, pasa su DNI (tiene 30 segundos desde que el Panel muestra <b>pase su DNI</b>). Los documentos se revisan con el DNI.
              </li>
            </Lista>
            <p className="mt-3">
              En <b>facial primero</b>, si pasa el DNI sin haber hecho antes rostro y alcohol, se deniega (<b>DNI antes del facial</b>). En los dos
              órdenes vale la primera prueba de alcohol: volver a soplar enseguida no cambia el resultado. Si da alcohol, queda denegado con
              su nombre aunque no pase el DNI.
            </p>
          </>
        ),
      },
      {
        titulo: "Monitor del G4 Pro",
        descripcion: "Cada prueba del terminal, en vivo",
        contenido: (
          <>
            <p className="mb-3">
              En <b>Sistema y APIs</b>, la tarjeta <b>Monitor del G4 Pro</b> tiene el botón <b>Abrir monitor</b>: abre una página con cada
              prueba de rostro y alcohol que manda el terminal facial, la más reciente arriba. Como el Panel, empieza en el día de hoy
              (puede elegir otro día o <b>Todos los días</b>), busca por nombre o DNI y muestra 10 por página. Hoy se actualiza sola (<b>En vivo</b>).
            </p>
            <Lista>
              <li>
                <b>Prueba:</b> hora del soplido según el terminal y su número de marcación.
              </li>
              <li>
                <b>Llegó:</b> cuándo llegó al sistema y cuántos segundos después del soplido (lo normal es 10 a 12; si pasa de 15, se
                marca).
              </li>
              <li>
                <b>Persona</b> y <b>Alcohol:</b> quién sopló y cuánto dio (verde, bien; rojo, alcohol).
              </li>
              <li>
                <b>Qué hizo el sistema</b> e <b>Ingreso:</b> cómo se usó la prueba y en qué ingreso terminó.
              </li>
            </Lista>
            <p className="mt-3">
              Si aparece <b>No llegó la prueba N.º …</b>, el terminal hizo una prueba que no llegó al sistema: revise la conexión del
              terminal.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "cuenta",
    titulo: "Su cuenta y contraseña",
    descripcion: "Cambie su contraseña desde su nombre, arriba a la derecha.",
    roles: ["administrador", "vigilancia"],
    pantallas: [
      {
        titulo: "Cambiar contraseña",
        descripcion: "Desde su menú",
        clave: "contrasena",
        puntos: [
          {
            titulo: "Contraseña actual",
            texto: <p>Toque su nombre, arriba a la derecha, y elija <b>Cambiar contraseña</b>. Escriba la que usa hoy.</p>,
          },
          { titulo: "Contraseña nueva", texto: <p>Al menos 10 caracteres, con letras y números.</p> },
          { titulo: "Repítala", texto: <p>Para evitar errores al escribirla.</p> },
          {
            titulo: "Cambiar contraseña",
            texto: (
              <>
                <p>
                  Su sesión sigue abierta. Si la tenía abierta en otro equipo, allí tendrá que volver a ingresar. Queda en la Auditoría.
                </p>
                <p>Si olvidó su contraseña, no hay recuperación por correo: pida al soporte técnico que la restablezca.</p>
              </>
            ),
          },
        ],
      },
    ],
  },
];
