"use client";
import Pagination from "./Pagination";

export function TableFooter({
  from,
  to,
  total,
  page,
  totalPages,
  onPageChange,
}: {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando {from} a {to} de {total} {total === 1 ? "registro" : "registros"}
      </p>
      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />}
    </div>
  );
}
