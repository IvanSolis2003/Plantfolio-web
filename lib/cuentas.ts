import { randomBytes } from "node:crypto";

export const HORAS_DE_VIGENCIA = 24;
export const LARGO_TOKEN = 32;

export type EstadoCuenta = "sin-verificar" | "esperando-aprobacion" | "lista";

export function nuevoToken(): string {
  return randomBytes(LARGO_TOKEN).toString("hex");
}

export function vencimiento(desde: Date = new Date()): Date {
  return new Date(desde.getTime() + HORAS_DE_VIGENCIA * 60 * 60 * 1000);
}

export function tokenVigente(expira: Date | null, ahora: Date = new Date()): boolean {
  if (!expira) return false;
  return expira.getTime() > ahora.getTime();
}

export function estadoDe(cuenta: {
  emailVerificado: Date | null;
  aprobado: boolean;
}): EstadoCuenta {
  if (!cuenta.emailVerificado) return "sin-verificar";
  if (!cuenta.aprobado) return "esperando-aprobacion";
  return "lista";
}

export const MENSAJE_POR_ESTADO: Record<Exclude<EstadoCuenta, "lista">, string> = {
  "sin-verificar":
    "Todavía no confirmaste tu correo. Revisa tu bandeja, incluida la carpeta de spam.",
  "esperando-aprobacion":
    "Tu correo ya está confirmado. Falta que un administrador habilite tu cuenta.",
};

export function baseDeLaApp(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3001";
}
