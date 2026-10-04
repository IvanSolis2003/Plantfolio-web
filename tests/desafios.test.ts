import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { calcularDesafios, inicioTemporada, nombreTemporada } from "../lib/desafios.ts";
import { crearEntrada, crearPlanta } from "./fixtures.ts";

afterEach(() => mock.timers.reset());

function dia(anio: number, mes: number, diaDelMes: number): Date {
  return new Date(anio, mes - 1, diaDelMes, 12);
}

function desafio(entradas: ReturnType<typeof crearEntrada>[], id: string) {
  return calcularDesafios(entradas).find((d) => d.id === id);
}

test("nombra la temporada según el hemisferio sur", () => {
  assert.equal(nombreTemporada(dia(2026, 1, 15)), "Verano");
  assert.equal(nombreTemporada(dia(2026, 2, 28)), "Verano");
  assert.equal(nombreTemporada(dia(2026, 3, 1)), "Otoño");
  assert.equal(nombreTemporada(dia(2026, 6, 1)), "Invierno");
  assert.equal(nombreTemporada(dia(2026, 9, 19)), "Primavera");
  assert.equal(nombreTemporada(dia(2026, 12, 1)), "Verano");
});

test("el verano de enero y febrero empezó el diciembre del año anterior", () => {
  assert.deepEqual(inicioTemporada(dia(2026, 1, 15)), new Date(2025, 11, 1));
  assert.deepEqual(inicioTemporada(dia(2026, 2, 20)), new Date(2025, 11, 1));
});

test("diciembre abre su propio verano en el mismo año", () => {
  assert.deepEqual(inicioTemporada(dia(2026, 12, 5)), new Date(2026, 11, 1));
});

test("las demás temporadas empiezan el primer día del mes que corresponde", () => {
  assert.deepEqual(inicioTemporada(dia(2026, 4, 10)), new Date(2026, 2, 1));
  assert.deepEqual(inicioTemporada(dia(2026, 7, 10)), new Date(2026, 5, 1));
  assert.deepEqual(inicioTemporada(dia(2026, 10, 10)), new Date(2026, 8, 1));
});

test("solo cuentan las plantas identificadas dentro de la temporada actual", () => {
  mock.timers.enable({ apis: ["Date"], now: dia(2026, 9, 19) });
  const entradas = [
    crearEntrada({ id: "a", identifiedAt: dia(2026, 9, 5).toISOString() }),
    crearEntrada({ id: "b", identifiedAt: dia(2026, 8, 31).toISOString() }),
  ];
  const racha = desafio(entradas, "racha-temporada");
  assert.equal(racha?.progreso, 1);
  assert.equal(racha?.completado, false);
});

test("el progreso del desafío no pasa de la meta", () => {
  mock.timers.enable({ apis: ["Date"], now: dia(2026, 9, 19) });
  const entradas = Array.from({ length: 5 }, (_, i) =>
    crearEntrada({ id: `e${i}`, identifiedAt: dia(2026, 9, 10).toISOString() })
  );
  const racha = desafio(entradas, "racha-temporada");
  assert.equal(racha?.progreso, 3);
  assert.equal(racha?.completado, true);
});

test("reconoce nativas y rarezas destacadas de la temporada", () => {
  mock.timers.enable({ apis: ["Date"], now: dia(2026, 9, 19) });
  const entradas = [
    crearEntrada({
      identifiedAt: dia(2026, 9, 10).toISOString(),
      plant: crearPlanta({ nativeToChile: true, rarity: "CASI_EXTINTA" }),
    }),
  ];
  assert.equal(desafio(entradas, "nativa-temporada")?.completado, true);
  assert.equal(desafio(entradas, "rareza-temporada")?.completado, true);
});

test("una planta común y no nativa no completa nativa ni rareza", () => {
  mock.timers.enable({ apis: ["Date"], now: dia(2026, 9, 19) });
  const entradas = [crearEntrada({ identifiedAt: dia(2026, 9, 10).toISOString() })];
  assert.equal(desafio(entradas, "nativa-temporada")?.completado, false);
  assert.equal(desafio(entradas, "rareza-temporada")?.completado, false);
});
