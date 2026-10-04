import { test } from "node:test";
import assert from "node:assert/strict";
import { esNativaDeChile } from "../lib/floraNativaChile.ts";

test("reconoce especies nativas de Chile", () => {
  for (const especie of ["Lapageria rosea", "Araucaria araucana", "Jubaea chilensis", "Ugni molinae"]) {
    assert.equal(esNativaDeChile(especie), true, especie);
  }
});

test("no marca como nativas las especies ornamentales o extranjeras", () => {
  for (const especie of ["Quercus robur", "Acer palmatum", "Ginkgo biloba", "Rosa canina"]) {
    assert.equal(esNativaDeChile(especie), false, especie);
  }
});

test("un nombre libre escrito a mano no es nativo", () => {
  assert.equal(esNativaDeChile("Rosa de mi patio"), false);
});

test("la comparación distingue mayúsculas del nombre científico", () => {
  assert.equal(esNativaDeChile("lapageria rosea"), false);
});
