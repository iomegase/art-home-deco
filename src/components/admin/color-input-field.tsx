"use client";

import { useMemo, useState } from "react";

type ColorInputFieldProps = {
  name: string;
  label: string;
  defaultValue: string;
};

function normalizeHex(value: string, fallback: string) {
  const raw = value.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const r = raw[1];
    const g = raw[2];
    const b = raw[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return raw.toLowerCase();
  }
  return fallback;
}

export function ColorInputField({ name, label, defaultValue }: ColorInputFieldProps) {
  const initial = useMemo(() => normalizeHex(defaultValue, "#000000"), [defaultValue]);
  const [color, setColor] = useState(initial);

  return (
    <label className="grid">
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(normalizeHex(e.target.value, color))}
          className="h-10 w-10 cursor-pointer rounded-xl border border-[#ececef] bg-white p-0"
          aria-label={`Choisir ${label}`}
        />
        <input
          name={name}
          value={color}
          onChange={(e) => setColor(normalizeHex(e.target.value, color))}
          className="w-full rounded-xl border border-[#ececef] bg-white px-3 py-2.5 text-[13px] text-[#0f1115] outline-none transition focus:border-[#111]"
          required
        />
      </div>
    </label>
  );
}
