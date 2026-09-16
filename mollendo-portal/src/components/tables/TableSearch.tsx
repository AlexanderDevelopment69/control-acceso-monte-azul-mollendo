"use client";
import Input from "@/components/form/input/InputField";

export function TableSearch({
  value,
  onChange,
  placeholder = "Buscar…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="w-full max-w-xs">
      <Input defaultValue={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
