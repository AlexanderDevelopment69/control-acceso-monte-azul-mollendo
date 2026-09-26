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
    roles: ["administrador", "vigilancia"],
    contenido: (
      <div className="space-y-3">
        <p>
          Este sistema controla el ingreso y salida de personas al Terminal de Mollendo. Hay dos tipos de cuenta, y
          cada una ve solo las secciones que le corresponden en el menú de la izquierda:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Administrador</strong>: carga todo en el sistema. Su pantalla de trabajo es{" "}
            <strong>Personal y documentos</strong>, donde registra al personal, sube sus documentos y agenda visitas.
            En <strong>Configuración</strong> define empresas, puestos, tipos de documento y usuarios, y además
            supervisa el sistema (panel de vigilancia, auditoría y estado técnico).
          </li>
          <li>
            <strong>Vigilancia</strong>: ve en tiempo real cada ingreso y salida por el molinete, y por qué se
            autoriza o deniega cada uno. No modifica datos.
          </li>
        </ul>
        <p className="text-xs text-gray-400">
          Las empresas proveedoras no tienen cuenta propia: el administrador carga sus datos.
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
          la pantalla de trabajo diario. A la izquierda está la lista del personal de todas las empresas; cada persona
          lleva un <strong>✔</strong> si hoy puede ingresar o un <strong>✖</strong> con el motivo si no puede. Puedes
          buscar por nombre, DNI o empresa, y filtrar por empresa o por quién puede o no puede ingresar.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            <strong>“+ Nueva persona”</strong> → empresa, tipo y número de documento, nombres, apellidos, puesto y,
            opcionalmente, el área. El número de documento debe coincidir con el que el terminal de reconocimiento facial
            tiene enrolado para esa persona.
          </li>
          <li>
            Al elegir a una persona se abre su ficha, con la tabla de <strong>documentos que exige su puesto</strong>:
            cuáles faltan, cuáles están vencidos y cuáles están vigentes.
          </li>
          <li>
            Usa <strong>“Subir”</strong> o <strong>“Renovar”</strong> en la fila del documento: el formulario de abajo
            queda con ese documento elegido, y solo tienes que poner la fecha de vencimiento y el archivo.{" "}
            <strong>El documento queda válido desde que lo cargas</strong>; no hay aprobación. Al renovar, solo cuenta la
            versión más reciente; las anteriores quedan en el historial como “Reemplazado”.
          </li>
          <li>Desde la misma ficha puedes <strong>cambiar el puesto</strong> de la persona.</li>
          <li>
            Si alguien deja de trabajar en el Terminal, usa <strong>“Dar de baja”</strong>. Desde ese momento se le
            deniega el ingreso automáticamente, sin importar sus documentos.
          </li>
        </ol>
        <p className="text-xs text-gray-400">
          El ✔ supone que la prueba de alcohol saldrá conforme: el alcohol solo se sabe en garita. Una persona sin puesto
          asignado siempre tiene ✖.
        </p>
      </div>
    ),
  },
  {
    id: "visitas",
    titulo: "Visitas",
    roles: ["administrador"],
    contenido: (
      <div className="space-y-3">
        <p>
          Una visita se registra como cualquier persona (con un puesto de visita y los documentos que ese puesto exige).
          Luego, en la sección <strong>Visitas</strong> de su ficha, agendas a quién visita, el motivo y la fecha y hora.
        </p>
        <p>
          La visita no pasa por aprobación: queda “programada” y puede cancelarse. Es solo informativa: en garita la
          persona se valida igual que cualquier otra (puesto, documentos vigentes y alcohol).
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
          en vivo cada ingreso y salida por el molinete apenas ocurre, autorizado o denegado.
        </p>
        <p>Cuando la persona se identifica en el terminal y hace la prueba de alcohol, el sistema revisa en este orden:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Si el documento <strong>no está registrado</strong> o la persona está <strong>dada de baja</strong>, se
            deniega de inmediato.
          </li>
          <li>
            Si no, se revisan juntos: que tenga <strong>puesto asignado</strong>, que sus{" "}
            <strong>documentos obligatorios estén vigentes</strong> y que la <strong>prueba de alcohol</strong> sea
            conforme. Si falla algo, se muestran todos los motivos a la vez.
          </li>
          <li>Si todo está conforme, el molinete se abre.</li>
        </ol>
        <p>
          La salida solo se registra y abre el molinete; no se exige un ingreso previo. Si el servidor deja de
          responder, aparece un aviso arriba a la derecha: mientras dure, no se valida ningún ingreso.
        </p>
      </div>
    ),
  },
  {
    id: "configuracion",
    titulo: "Configuración",
    roles: ["administrador"],
    contenido: (
      <div className="space-y-4">
        <p>
          <Link href="/configuracion" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Configuración</Link> reúne
          los catálogos que se cargan al inicio y cambian poco, en cuatro pestañas:
        </p>
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-200">Empresas</p>
          <p>
            Alta de las empresas proveedoras o clientes (RUC, razón social, correo de contacto). Toda persona pertenece a
            una empresa. <strong>“Desactivar”</strong> no borra sus datos; solo deja de aparecer al registrar personal
            nuevo. Las empresas no tienen cuenta propia: el administrador carga sus datos.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-200">Puestos y requisitos</p>
          <p>
            Un puesto agrupa a personas que deben presentar los mismos documentos (por ejemplo “Estibador” o “Visita
            administrativa”). Desde el ícono de requisitos de cada puesto marcas qué documentos son{" "}
            <strong>obligatorios</strong>: esos son los que bloquean el ingreso si faltan o están vencidos.
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-200">Tipos de documento</p>
          <p>El catálogo de documentos que se pueden exigir (SCTR, inducción, carné de vacunación, etc.) y cómo se validan:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li><strong>Fecha de vencimiento</strong>: deja de ser válido al día siguiente de su fecha de vencimiento.</li>
            <li><strong>Sí/No</strong>: basta con que esté cargado; no vence.</li>
            <li><strong>Vigente por actividad</strong>: igual que “Sí/No”, salvo que se le cargue una fecha de vencimiento.</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-200">Usuarios</p>
          <p>
            Crea las cuentas de Vigilancia (o de otro administrador) con su correo y una contraseña inicial. El sistema no
            envía correos, así que no hay recuperación de contraseña: si alguien la olvida, usa{" "}
            <strong>“Restablecer contraseña”</strong> y comunícale la nueva. <strong>“Dar de baja”</strong> impide que
            esa cuenta vuelva a iniciar sesión. No puedes dar de baja tu propia cuenta.
          </p>
        </div>
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
          un registro de solo lectura de quién creó o modificó cada dato del sistema (empresas, personas, documentos,
          puestos, visitas, usuarios) y cuándo. Sirve para rastrear un cambio o responder “¿quién cargó esto?”.
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
          si el backend y la base de datos responden y si la clave de equipos está configurada. También trae la
          documentación técnica, con ejemplos, de las APIs que usan los equipos físicos: el terminal ZKTeco G4 Pro
          con su alcoholímetro (a través de ZKBio CVSecurity) y el molinete. Está pensada para quien tenga que
          conectarlos o dar soporte técnico.
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
    <RequireRole roles={["administrador", "vigilancia"]}>
      <ManualContent />
    </RequireRole>
  );
}
