"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import type { RolUsuario } from "@/lib/api/types";

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
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Administrador</strong>: registra al personal (y su empresa, si es nueva) y sube sus
            documentos desde <strong>Personal y documentos</strong>. También ve el <strong>Dashboard</strong> de
            indicadores, descarga <strong>Reportes</strong> en Excel o PDF y supervisa el sistema (panel de vigilancia,
            auditoría y estado técnico).
          </li>
          <li>
            <strong>Vigilancia</strong>: ve en tiempo real cada ingreso y salida por el molinete, y por qué se
            autoriza o deniega cada uno. No modifica datos.
          </li>
        </ul>
        <p className="text-xs text-gray-400">
          Las empresas proveedoras no tienen cuenta propia: el administrador carga sus datos. No hay perfiles ni
          puestos: el administrador registra empresa, personal y documentos, nada más.
        </p>
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
          la pantalla de trabajo. A la izquierda está la lista del personal de todas las empresas; cada persona lleva un{" "}
          <strong>✔</strong> si hoy puede ingresar o un <strong>✖</strong> con el motivo si no puede. Puedes buscar por
          nombre, DNI o empresa, y filtrar por empresa o por quién puede o no puede ingresar (los números de cada
          pestaña cuentan solo lo que queda con la empresa y la búsqueda elegidas).
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            <strong>“+ Nuevo personal”</strong>: en un solo formulario se registra a la persona y sus documentos.
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <strong>Empresa</strong>: elígela de la lista; si no está, “+ Nueva empresa…” y escribe su RUC, razón
                social y correo ahí mismo.
              </li>
              <li>
                <strong>Tipo y número de documento, nombres y apellidos.</strong> El DNI va con sus 8 dígitos, sin
                espacios ni guiones: es el número con el que la persona se identifica en el lector de DNI del molinete.
              </li>
              <li>
                <strong>Foto del personal</strong> (obligatoria): de frente y con buena luz; JPG, PNG o WEBP de hasta 5
                MB. El sistema la envía al terminal facial, que la usa para reconocer a la persona: no hace falta
                registrar su rostro en el equipo. Se puede cambiar después desde su ficha (“Cambiar foto”); el
                terminal se actualiza solo.
              </li>
              <li>
                <strong>Documentos</strong> (al menos uno): escribe el nombre del documento (p. ej. SCTR), elige su fecha
                de vencimiento en el calendario (vacía si no vence) y adjunta el archivo (PDF, imagen JPG, PNG o WEBP, o
                Word, hasta 20 MB). Con{" "}
                <strong>“+ Agregar otro documento”</strong> subes varios a la vez.
              </li>
            </ul>
            Los documentos quedan <strong>válidos desde que se cargan</strong>; no hay aprobación. Si un documento falla
            al subirse, el personal ya queda registrado: corrige ese documento y vuelve a guardar.
          </li>
          <li>
            En la ficha, la tabla <strong>Documentos</strong> muestra cada documento con su vencimiento y si está
            vigente o vencido. Desde ahí puedes:
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <strong>“Ver”</strong>: abre el archivo cargado en una pestaña nueva (PDF o imagen); si es Word, se
                descarga. También se puede ver cada versión anterior desde el historial.
              </li>
              <li>
                <strong>“Renovar”</strong>: sube la versión nueva de ese documento (nuevo vencimiento y archivo). Solo
                cuenta la más reciente; las anteriores quedan en el historial como “Reemplazado”.
              </li>
              <li>
                <strong>“Eliminar”</strong>: borra el documento con todas sus versiones y archivos (pide confirmación y
                queda en la auditoría). Si era el único, la persona no podrá ingresar hasta que se le agregue otro.
              </li>
              <li>
                <strong>“+ Agregar documento”</strong>: agrega un documento que no tenía (nombre, vencimiento y archivo).
              </li>
            </ul>
          </li>
          <li>
            Si alguien deja de trabajar en el Terminal, usa <strong>“Dar de baja”</strong> y confírmalo en la ventana que
            aparece. Desde ese momento se le deniega el ingreso automáticamente, sin importar sus documentos (sí puede
            salir). Sus datos e historial se conservan, y con <strong>“Reactivar”</strong> (también con confirmación) vuelve a
            quedar habilitado; si tiene documentos vencidos, la ventana avisa que aún debe regularizarlos para ingresar.
          </li>
        </ol>
        <p className="text-xs text-gray-400">
          El personal puede ingresar si no está dado de baja, tiene al menos un documento cargado y ninguno está
          vencido. El ✔ supone que la prueba de alcohol saldrá conforme: el alcohol solo se sabe en garita. El sistema no
          sabe qué documentos le corresponden a cada persona; que se suban los correctos depende del administrador.
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
          en vivo cada ingreso y salida por el molinete apenas ocurre, autorizado o denegado: la fila nueva aparece
          arriba de la tabla (el último evento queda resaltado unos segundos), y los contadores se actualizan solos. Los intentos con un documento
          no registrado también quedan en la tabla, como “No registrado”.
        </p>
        <p>
          La tabla muestra por defecto los movimientos de <strong>hoy</strong>. Con el calendario se puede ver otro día
          (“Hoy” vuelve al día actual) o “Todos los días”. El buscador encuentra por nombre, apellido o número de
          documento en todo el historial, no solo en la página que se está viendo. La tabla va de 10 en 10, con
          páginas.
        </p>
        <p>
          Cuando un ingreso se deniega por documentos, el motivo <strong>“Documentos ›”</strong> abre una ventana con los
          documentos de la persona y cuáles debe regularizar; con <strong>“Ver”</strong> se abre cada archivo.
        </p>
        <p>El ingreso se valida en dos pasos:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            <strong>Al pasar el DNI por el lector:</strong> si el documento <strong>no está registrado</strong>, la
            persona está <strong>dada de baja</strong>, <strong>no tiene documentos</strong> cargados o alguno está{" "}
            <strong>vencido</strong>, se deniega de inmediato y se muestran los motivos.
          </li>
          <li>
            <strong>En el terminal facial:</strong> si los documentos están en regla, el sistema habilita en el terminal{" "}
            <strong>solo a esa persona</strong>, por 1 minuto: el terminal no acepta el rostro de nadie más. La persona
            muestra el rostro y hace la <strong>prueba de alcohol</strong>; si ambos son conformes, el sistema abre el
            molinete y el ingreso queda autorizado. Si el alcohol no es conforme, queda denegado por alcohol; si no se
            completa en el minuto, queda denegado con <strong>“No completó rostro y alcohol”</strong>. Al terminar, se le
            quita el permiso en el terminal.
          </li>
        </ol>
        <p>
          Mientras espera, la persona aparece en la primera fila del historial como <strong>“en espera”</strong>, con su{" "}
          <strong>foto</strong> (para compararla con quien está frente al terminal), el tiempo que le queda y una barra que
          se va vaciando. Se habilita a una persona a la vez: si otra pasa su DNI mientras tanto, figura{" "}
          <strong>“en cola”</strong> (“Esperando su turno en el terminal facial”) y su minuto empieza cuando termina la
          anterior. Al llegar el resultado, la fila pasa a ser el ingreso autorizado o denegado.
        </p>
        <p>
          La salida solo exige un DNI registrado (aunque la persona esté dada de baja o tenga documentos vencidos) y
          abre el molinete; no se exige un ingreso previo. Si el servidor deja de
          responder, aparece un aviso arriba a la derecha: mientras dure, no se valida ningún ingreso.
        </p>
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
          resume en indicadores y gráficos lo que pasa en el terminal. Cada ingreso autorizado de una persona cuenta como
          una visita. Se actualiza solo con cada ingreso o salida.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Presentes actualmente</strong>: todas las personas que están dentro ahora, sin importar cuándo
            entraron. Debajo se indica cuántas ingresaron en el periodo (las “presentes” del gráfico) y cuántas antes.
          </li>
          <li>
            <strong>Total de visitas</strong>: ingresos autorizados en el periodo elegido. De ellas, las{" "}
            <strong>finalizadas</strong> ya registraron su salida y las <strong>presentes</strong> todavía no.
          </li>
          <li>
            <strong>Permanencia mayor a 24 h</strong>: personas que ingresaron hace más de un día y no registran salida. Al
            final de la página está la lista con su tiempo dentro.
          </li>
          <li>
            Gráficos de visitas, ingresos y salidas por día, motivos de denegación, documentos del personal activo
            (vigentes, por vencer en 30 días y vencidos) y personal activo por empresa.
          </li>
        </ul>
        <p>
          Arriba se elige el periodo: hoy, últimos 7 días, este mes o un rango personalizado. Los indicadores de presencia
          dependen de que cada persona registre su salida en el molinete: si alguien sale sin registrarla, seguirá
          figurando como presente.
        </p>
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
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Personal y empresas</strong>: el personal con su empresa, estado y si puede ingresar (con el motivo).
            Filtros: empresa y activos o dados de baja.
          </li>
          <li>
            <strong>Documentos por persona</strong>: la última versión de cada documento, con su vencimiento y estado
            (vigente, por vencer en 30 días o vencido). Filtros: empresa y estado del documento. Con{" "}
            <strong>“Descargar con archivos (ZIP)”</strong> se baja además cada archivo, en carpetas por empresa y
            persona. Primero descomprime el ZIP (clic derecho → Extraer todo) y abre el Excel desde la carpeta extraída: el
            enlace “Abrir” de cada fila abre su archivo. Si se abre el Excel desde dentro del ZIP sin extraerlo, los
            enlaces no encuentran los archivos. También se pueden incluir los documentos anteriores que fueron renovados.
          </li>
          <li>
            <strong>Ingresos y salidas</strong>: el historial del periodo con resultado y motivo. Filtros: periodo,
            movimiento y resultado.
          </li>
          <li>
            <strong>Visitas del periodo</strong>: cada ingreso autorizado con su salida, duración y si está finalizada o
            presente.
          </li>
          <li>
            <strong>Personal presente</strong>: quiénes están dentro en el momento de descargarlo, con su tiempo dentro.
          </li>
          <li>
            <strong>Auditoría</strong>: quién creó, modificó o eliminó cada dato, en el periodo elegido.
          </li>
        </ul>
        <p>
          El Excel trae filtros en la cabecera y las fechas se pueden ordenar; el PDF sale en hoja horizontal con número de
          página. Un reporte puede tener hasta 20 000 filas: si pide más, acota el periodo o los filtros.
        </p>
      </div>
    ),
  },
  {
    id: "cuenta",
    titulo: "Tu cuenta y contraseña",
    roles: ["administrador", "vigilancia"],
    contenido: (
      <div className="space-y-3">
        <p>
          Para cambiar tu contraseña, haz clic en tu nombre de usuario (arriba a la derecha) y elige{" "}
          <strong>“Cambiar contraseña”</strong>. Escribe tu contraseña actual y dos veces la nueva, de al menos 8
          caracteres. Tu sesión sigue abierta; si la tenías abierta en otro equipo, allí tendrás que volver a ingresar. El
          cambio queda registrado en la auditoría.
        </p>
        <p className="text-xs text-gray-400">
          Si olvidaste tu contraseña, no hay recuperación por correo: pide al soporte técnico del sistema que la restablezca.
        </p>
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
        <p>
          Se puede buscar por el correo del usuario o por el tipo de dato (“personal”, “documento”, “empresa”…) y filtrar
          por un rango de fechas (“Desde” y “Hasta”). La búsqueda recorre todos los registros, sin importar su antigüedad.
        </p>
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
          <Link href="/sistema" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Sistema y APIs</Link> muestra
          si el backend y la base de datos responden, si la clave de equipos está configurada, el estado de los{" "}
          <strong>respaldos</strong> (el último y si está al día), el de los <strong>equipos</strong> (cada terminal G4
          Pro “En línea” o “Desconectado”, con su última actividad) y el de los <strong>lectores de DNI</strong> de ingreso y
          salida (“Cable conectado”, “Cable desconectado” o “Sin configurar”, con la hora de su última lectura; el sistema ve el cable de datos, no si el lector tiene energía: si no pita al pasar un DNI, hay que revisar su alimentación) y el de los <strong>relés de los molinetes</strong> (ingreso y salida “Conectado” o “No conectado”, con la última apertura). También trae el enlace a la documentación interactiva de la API (Swagger) y
          la documentación técnica, con ejemplos, de las APIs que usan los equipos físicos: el terminal ZKTeco G4 Pro
          con su alcoholímetro (protocolo PUSH del fabricante), los lectores de DNI y los molinetes, indicando el estado
          de cada una. Está pensada para quien tenga que conectarlos o dar soporte técnico.
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
