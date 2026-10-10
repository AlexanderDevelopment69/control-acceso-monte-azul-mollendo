"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !(event.target as HTMLElement).closest('.dropdown-toggle')
    ) {
      onClose();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [onClose]);


  // Sigue montado un instante al cerrarse, para que se desvanezca (igual que el calendario).
  const [montado, setMontado] = useState(isOpen);
  if (isOpen && !montado) setMontado(true);
  useEffect(() => {
    if (isOpen || !montado) return;
    const t = setTimeout(() => setMontado(false), 100);
    return () => clearTimeout(t);
  }, [isOpen, montado]);

  if (!montado) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-40 right-0 mt-2 origin-top-right rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${
        isOpen ? "animate-panel-entra" : "pointer-events-none animate-panel-sale"
      } ${className}`}
    >
      {children}
    </div>
  );
};
