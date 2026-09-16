"use client";

import React from "react";
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
    roles: ["administracion", "empresa", "vigilancia"],
    contenido: (
      <div className="space-y-3">
        <p>
          Este sistema controla el ingreso y salida de personas al Terminal de Mollendo. Hay tres tipos de cuenta,
          cada una ve solo las secciones que le corresponden en el menú de la izquierda:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Administración</strong>: da de alta empresas proveedoras, define los puestos y qué documentos
            exige cada uno, y supervisa todo el sistema (auditoría, estado técnico, configuración de correo).
          </li>
          <li>
            <strong>Empresa</strong>: cada empresa proveedora gestiona a su propio personal (trabajadores y
            visitas) y sus solicitudes de visita — solo ve lo que pertenece a su empresa.
          </li>
          <li>
            <strong>Vigilancia</strong>: ve en tiempo real los ingresos/salidas del personal por el torniquete, y
            por qué se autoriza o deniega cada uno.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "empresas",
    titulo: "Empresas",
    roles: ["administracion"],
    contenido: (
      <div className="space-y-3">
        <p>
          Antes de que el personal de una empresa proveedora pueda acceder al sistema, hay que darla de alta desde{" "}
          <Link href="/empresas" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Empresas</Link>.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>“+ Nueva empresa” → completa RUC, razón social y correo de contacto (el teléfono es opcional).</li>
          <li>
            Con la empresa creada, presiona <strong>“Invitar”</strong> — se envía un correo al correo de contacto
            con un enlace para que esa empresa active su cuenta y cree su propia contraseña. El enlace vence en 48
            horas.
          </li>
          <li>
            Si necesitas suspender a una empresa temporalmente (por ejemplo, contrato vencido), usa{" "}
            <strong>“Desactivar”</strong> — no borra sus datos, solo le impide operar hasta reactivarla.
          </li>
        </ol>
        <p className="text-xs text-gray-400">
          El envío del correo de invitación depende de que el correo (SMTP) esté configurado — ver la sección{" "}
          <a href="#configuracion-smtp" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Configuración (correo SMTP)
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    id: "puestos",
    titulo: "Puestos y requisitos",
    roles: ["administracion"],
    contenido: (
      <div className="space-y-3">
        <p>
          Un <strong>puesto</strong> (en <Link href="/puestos" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Puestos</Link>) agrupa a personas con el mismo caso de uso — por ejemplo “Estibador”,
          “Visita administrativa”, “Contratista de mantenimiento” — y cada uno pertenece a uno de 4 casos: visita,
          personal propio, contratista o tercero.
        </p>
        <p>
          Cada puesto tiene su propia <strong>matriz de requisitos</strong>: qué tipos de documento debe presentar
          esa persona (y si son obligatorios u opcionales) para que se le autorice el ingreso. Se configura
          entrando al ícono de requisitos de cada puesto en la tabla.
        </p>
        <p className="text-xs text-gray-400">
          Si una persona no tiene puesto asignado, el sistema no tiene reglas de documentos que evaluar para ella y
          la autoriza sin exigir documentos — asigna un puesto apenas el catálogo esté definido.
        </p>
      </div>
    ),
  },
  {
    id: "tipos-documento",
    titulo: "Tipos de documento",
    roles: ["administracion"],
    contenido: (
      <div className="space-y-3">
        <p>
          En <Link href="/tipos-documento" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Tipos de documento</Link> se define el catálogo de documentos que se le pueden exigir a una persona
          (SCTR, CAMO, carné de vacunación, etc.), y cómo se valida cada uno:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Fecha de vencimiento</strong>: el documento deja de ser válido después de una fecha.</li>
          <li><strong>Sí/No</strong>: el documento simplemente está presente o no, sin fecha de vencimiento.</li>
          <li><strong>Vigente por actividad</strong>: válido mientras dure la actividad para la que se emitió.</li>
        </ul>
        <p>Un documento creado aquí puede luego marcarse como requisito (obligatorio u opcional) en uno o más puestos.</p>
      </div>
    ),
  },
  {
    id: "mi-personal",
    titulo: "Mi personal",
    roles: ["empresa"],
    contenido: (
      <div className="space-y-3">
        <p>
          En <Link href="/personal" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Mi personal</Link> registras a los trabajadores y visitas de tu empresa. Solo ves y gestionas tu propio
          personal, nunca el de otras empresas.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>“+ Nueva persona” → tipo y número de documento, nombres, apellidos, y opcionalmente el puesto y el área.</li>
          <li>
            Entra al expediente de la persona para subir los documentos que su puesto exige (archivo real, no solo
            un dato) — quedan en estado “pendiente” hasta que Administración los apruebe o rechace.
          </li>
          <li>
            Si alguien deja de trabajar para tu empresa, usa <strong>“Dar de baja”</strong> en su expediente — a
            partir de ese momento se le deniega el ingreso automáticamente, sin importar sus documentos.
          </li>
        </ol>
      </div>
    ),
  },
  {
    id: "visitas",
    titulo: "Solicitudes de visita",
    roles: ["empresa"],
    contenido: (
      <div className="space-y-3">
        <p>
          En <Link href="/visitas" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Solicitudes de visita</Link> registras una visita programada: a quién visita dentro del Terminal, el
          motivo y la fecha/hora. Queda “programada” automáticamente (no requiere aprobación aparte) y puede
          cancelarse mientras no se haya realizado.
        </p>
      </div>
    ),
  },
  {
    id: "vigilancia",
    titulo: "Panel de vigilancia",
    roles: ["vigilancia", "administracion"],
    contenido: (
      <div className="space-y-3">
        <p>
          El <Link href="/vigilancia" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Panel de vigilancia</Link> muestra en vivo cada intento de ingreso/salida por el torniquete —
          autorizado o denegado — apenas ocurre, junto con el motivo cuando se deniega: persona dada de baja,
          alcohol no conforme, documentos faltantes/vencidos, o (en la salida) que no hubo un ingreso previo
          registrado.
        </p>
        <p>
          Un indicador de <strong>modo contingencia</strong> avisa si el servidor central deja de responder (hace
          ping cada 15 segundos), para saber si hay que operar temporalmente de otra forma.
        </p>
      </div>
    ),
  },
  {
    id: "auditoria",
    titulo: "Auditoría",
    roles: ["administracion"],
    contenido: (
      <div className="space-y-3">
        <p>
          <Link href="/auditoria" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Auditoría</Link> es un registro de solo lectura de quién creó, modificó o aprobó cada dato importante del
          sistema (empresas, personas, documentos, puestos, etc.) y cuándo — útil para rastrear un cambio o resolver
          una duda sobre “quién hizo esto”.
        </p>
      </div>
    ),
  },
  {
    id: "sistema-apis",
    titulo: "Sistema y APIs",
    roles: ["administracion"],
    contenido: (
      <div className="space-y-3">
        <p>
          <Link href="/sistema" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Sistema y APIs</Link> muestra si el backend, la base de datos y las integraciones (correo, clave de
          equipos) están arriba y configuradas, y trae la documentación técnica (con ejemplos) de las APIs que usan
          los equipos físicos — el lector de DNI, el alcoholímetro y el torniquete — para quien tenga que
          conectarlos o dar soporte técnico.
        </p>
      </div>
    ),
  },
  {
    id: "configuracion-smtp",
    titulo: "Configuración (correo SMTP)",
    roles: ["administracion"],
    contenido: (
      <div className="space-y-3">
        <p>
          En <Link href="/configuracion" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Configuración</Link> se define qué servidor de correo usa el sistema para enviar las invitaciones a
          empresas y los correos de recuperación de contraseña.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Host / Puerto</strong>: la dirección del servidor SMTP de tu proveedor de correo.</li>
          <li>
            <strong>Conexión segura (TLS/SSL)</strong>: actívala solo si tu proveedor usa el puerto 465; para el
            puerto 587 (el más común) déjala desactivada.
          </li>
          <li><strong>Usuario / Contraseña</strong>: las credenciales para autenticarse contra ese servidor.</li>
          <li>
            <strong>Remitente</strong>: la dirección que aparece como “De:” en los correos que reciben las
            personas — normalmente debe coincidir con el usuario configurado (algunos proveedores, como Gmail, lo
            exigen).
          </li>
        </ul>
        <p>
          Después de guardar, usa <strong>“Enviar correo de prueba”</strong> para confirmar que de verdad funciona
          antes de depender de él. Si quitas la configuración, el sistema vuelve a intentar usar las variables de
          entorno del servidor (si existen) — y si tampoco hay ninguna, los correos simplemente quedan registrados
          en el log del backend en vez de enviarse.
        </p>
      </div>
    ),
  },
];

function ManualContent() {
  const { user } = useAuth();
  const secciones = SECCIONES.filter((s) => !user || s.roles.includes(user.rol));

  return (
    <div>
      <PageHeader title="Manual" description="Guía de uso del sistema, dividida por secciones." />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] lg:sticky lg:top-6 lg:w-64 lg:shrink-0">
          <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-gray-400">Secciones</p>
          <ul className="space-y-1">
            {secciones.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  {s.titulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 space-y-6">
          {secciones.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
            >
              <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">{s.titulo}</h2>
              <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{s.contenido}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ManualPage() {
  return (
    <RequireRole roles={["administracion", "empresa", "vigilancia"]}>
      <ManualContent />
    </RequireRole>
  );
}
