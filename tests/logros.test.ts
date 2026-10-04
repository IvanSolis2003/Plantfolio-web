import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularLogros } from "../lib/logros.ts";
import { crearEntrada, crearPlanta } from "./fixtures.ts";

function desbloqueados(entradas: ReturnType<typeof crearEntrada>[]): string[] {
  return calcularLogros(entradas).filter((l) => l.desbloqueado).map((l) => l.id);
}

test("sin plantas no hay ningún logro", () => {
  assert.deepEqual(desbloqueados([]), []);
});

test("la primera planta desbloquea solo primera-planta", () => {
  assert.deepEqual(desbloqueados([crearEntrada()]), ["primera-planta"]);
});

test("coleccionista requiere 10 plantas", () => {
  const nueve = Array.from({ length: 9 }, (_, i) => crearEntrada({ id: `e${i}` }));
  assert.equal(desbloqueados(nueve).includes("coleccionista"), false);
  assert.equal(desbloqueados([...nueve, crearEntrada({ id: "e9" })]).includes("coleccionista"), true);
});

test("explorador cuenta especies distintas, no plantas repetidas", () => {
  const repetidas = Array.from({ length: 6 }, (_, i) => crearEntrada({ id: `e${i}`, plantId: "misma" }));
  assert.equal(desbloqueados(repetidas).includes("explorador"), false);
  const distintas = Array.from({ length: 5 }, (_, i) => crearEntrada({ id: `e${i}`, plantId: `p${i}` }));
  assert.equal(desbloqueados(distintas).includes("explorador"), true);
});

test("guardián solo con rareza protegida o casi extinta", () => {
  const rara = crearEntrada({ plant: crearPlanta({ rarity: "POCO_COMUN" }) });
  const protegida = crearEntrada({ plant: crearPlanta({ rarity: "PROTEGIDA" }) });
  assert.equal(desbloqueados([rara]).includes("cazador-rarezas"), true);
  assert.equal(desbloqueados([rara]).includes("guardian"), false);
  assert.equal(desbloqueados([protegida]).includes("guardian"), true);
});

test("fotógrafo de campo requiere latitud y longitud, no solo una", () => {
  assert.equal(desbloqueados([crearEntrada({ latitude: -35.4 })]).includes("fotografo-de-campo"), false);
  assert.equal(
    desbloqueados([crearEntrada({ latitude: -35.4, longitude: -71.6 })]).includes("fotografo-de-campo"),
    true
  );
});
