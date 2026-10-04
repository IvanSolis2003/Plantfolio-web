import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { diasDesdeUltimoRiego, necesitaRiego } from "../lib/riego.ts";
import { crearEntrada, crearPlanta, haceDias } from "./fixtures.ts";

const AHORA = new Date("2026-06-15T12:00:00.000Z");

afterEach(() => mock.timers.reset());

function congelarReloj() {
  mock.timers.enable({ apis: ["Date"], now: AHORA });
}

test("cuenta los días desde lastWatered cuando existe", () => {
  congelarReloj();
  const entrada = crearEntrada({
    identifiedAt: haceDias(30, AHORA),
    lastWatered: haceDias(3, AHORA),
  });
  assert.equal(diasDesdeUltimoRiego(entrada), 3);
});

test("si nunca se regó cuenta desde identifiedAt", () => {
  congelarReloj();
  const entrada = crearEntrada({ identifiedAt: haceDias(10, AHORA) });
  assert.equal(diasDesdeUltimoRiego(entrada), 10);
});

test("necesita riego exactamente al cumplirse la frecuencia", () => {
  congelarReloj();
  const plant = crearPlanta({ wateringFrequencyDays: 5 });
  assert.equal(necesitaRiego(crearEntrada({ plant, lastWatered: haceDias(4, AHORA) })), false);
  assert.equal(necesitaRiego(crearEntrada({ plant, lastWatered: haceDias(5, AHORA) })), true);
  assert.equal(necesitaRiego(crearEntrada({ plant, lastWatered: haceDias(9, AHORA) })), true);
});

test("una planta de riego frecuente se pasa antes que una tolerante a la sequía", () => {
  congelarReloj();
  const lastWatered = haceDias(6, AHORA);
  const frecuente = crearEntrada({ plant: crearPlanta({ wateringFrequencyDays: 2 }), lastWatered });
  const tolerante = crearEntrada({ plant: crearPlanta({ wateringFrequencyDays: 21 }), lastWatered });
  assert.equal(necesitaRiego(frecuente), true);
  assert.equal(necesitaRiego(tolerante), false);
});
