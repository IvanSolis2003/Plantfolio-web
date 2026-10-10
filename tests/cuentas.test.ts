import { test } from "node:test";
import assert from "node:assert/strict";
import { estadoDe, nuevoToken, tokenVigente, vencimiento, huellaDeToken, HORAS_DE_VIGENCIA, LARGO_TOKEN } from "../lib/cuentas.ts";

test("una cuenta sin correo verificado está sin-verificar aunque esté aprobada", () => {
  assert.equal(estadoDe({ emailVerificado: null, aprobado: true }), "sin-verificar");
  assert.equal(estadoDe({ emailVerificado: null, aprobado: false }), "sin-verificar");
});

test("correo verificado pero sin aprobar espera aprobación", () => {
  assert.equal(estadoDe({ emailVerificado: new Date(), aprobado: false }), "esperando-aprobacion");
});

test("correo verificado y aprobada está lista", () => {
  assert.equal(estadoDe({ emailVerificado: new Date(), aprobado: true }), "lista");
});

test("el token son 64 caracteres hexadecimales y no se repite", () => {
  const token = nuevoToken();
  assert.equal(token.length, LARGO_TOKEN * 2);
  assert.match(token, /^[0-9a-f]{64}$/);
  assert.notEqual(token, nuevoToken());
});

test("el vencimiento cae exactamente a las horas de vigencia", () => {
  const desde = new Date("2026-01-01T00:00:00.000Z");
  assert.equal(vencimiento(desde).getTime() - desde.getTime(), HORAS_DE_VIGENCIA * 60 * 60 * 1000);
});

test("un token solo es vigente antes de su expiración", () => {
  const ahora = new Date("2026-01-01T12:00:00.000Z");
  assert.equal(tokenVigente(new Date("2026-01-01T12:00:01.000Z"), ahora), true);
  assert.equal(tokenVigente(new Date("2026-01-01T12:00:00.000Z"), ahora), false);
  assert.equal(tokenVigente(new Date("2026-01-01T11:59:59.000Z"), ahora), false);
});

test("sin fecha de expiración el token no es vigente", () => {
  assert.equal(tokenVigente(null), false);
});

test("la huella del token es SHA-256 estable y distinta del token", () => {
  const token = nuevoToken();
  assert.match(huellaDeToken(token), /^[0-9a-f]{64}$/);
  assert.equal(huellaDeToken(token), huellaDeToken(token));
  assert.notEqual(huellaDeToken(token), token);
});
