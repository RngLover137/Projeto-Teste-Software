import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Weekday } from "./db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WEEKDAYS: { key: Weekday; label: string; short: string }[] = [
  { key: "monday",    label: "Segunda-feira", short: "Seg" },
  { key: "tuesday",   label: "Terça-feira",   short: "Ter" },
  { key: "wednesday", label: "Quarta-feira",  short: "Qua" },
  { key: "thursday",  label: "Quinta-feira",  short: "Qui" },
  { key: "friday",    label: "Sexta-feira",   short: "Sex" },
  { key: "saturday",  label: "Sábado",        short: "Sáb" },
  { key: "sunday",    label: "Domingo",       short: "Dom" },
];

export const ROLE_LABELS: Record<string, string> = {
  viewer: "Visualizador",
  editor: "Editor",
  admin: "Administrador",
};

export const ROLE_COLORS: Record<string, string> = {
  viewer: "bg-slate-100 text-slate-600",
  editor: "bg-brand-100 text-brand-700",
  admin:  "bg-emerald-100 text-emerald-700",
};

export const STATUS_LABELS: Record<string, string> = {
  pending:     "Pendente",
  in_progress: "Em andamento",
  done:        "Concluído",
};

export const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  done:        "bg-emerald-100 text-emerald-700",
};
