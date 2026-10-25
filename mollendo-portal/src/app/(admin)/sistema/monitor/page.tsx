"use client";

import React from "react";
import Link from "next/link";
import { RequireRole } from "@/lib/auth/RequireRole";
import { ChevronLeftIcon } from "@/icons";
import { MonitorG4 } from "../MonitorG4";

export default function MonitorG4Page() {
  return (
    <RequireRole roles={["administrador", "soporte"]}>
      <Link
        href="/sistema"
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400"
      >
        <ChevronLeftIcon className="size-4" />
        Sistema y APIs
      </Link>
      <MonitorG4 />
    </RequireRole>
  );
}
