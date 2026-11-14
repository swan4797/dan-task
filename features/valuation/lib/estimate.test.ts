import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  adjustToToday,
  buildComparables,
  confidenceFor,
  estimateValue,
  weightFor,
  weightedPercentile,
} from "./estimate.ts";
import type { HousePriceIndex, Sale } from "../types.ts";

const index: HousePriceIndex = {
  region: "Test",
  latestMonth: "2026-08",
  values: { "2024-08": 80, "2025-08": 90, "2026-08": 100 },
};

describe("weightedPercentile", () => {
  it("returns the plain median when weights are equal", () => {
    const items = [1, 2, 3, 4, 5].map((value) => ({ value, weight: 1 }));
    assert.equal(weightedPercentile(items, 0.5), 3);
  });

  it("is pulled towards heavily weighted values", () => {
    const items = [
      { value: 100, weight: 1 },
      { value: 200, weight: 1 },
      { value: 300, weight: 5 },
    ];
    assert.equal(weightedPercentile(items, 0.5), 300);
  });

  it("returns NaN for no items", () => {
    assert.ok(Number.isNaN(weightedPercentile([], 0.5)));
  });
});

describe("adjustToToday", () => {
  it("scales a sale by the change in index since the sale month", () => {
    assert.equal(adjustToToday(200_000, "2024-08-15", index), 250_000);
  });

  it("leaves sales after the latest index month unchanged", () => {
    assert.equal(adjustToToday(200_000, "2026-10-01", index), 200_000);
  });

  it("uses the next available month when the sale month is missing", () => {
    assert.equal(adjustToToday(180_000, "2025-03-01", index), 200_000);
  });
});

describe("weightFor", () => {
  it("halves at the half-weight distance and age", () => {
    assert.equal(weightFor(0, 0), 1);
    assert.equal(weightFor(500, 0), 0.5);
    assert.equal(weightFor(0, 24), 0.5);
  });
});

describe("confidenceFor", () => {
  it("rates by number of comparables", () => {
    assert.equal(confidenceFor(25), "high");
    assert.equal(confidenceFor(10), "medium");
    assert.equal(confidenceFor(3), "low");
  });
});

describe("estimateValue", () => {
  const now = new Date("2026-09-01");
  const sale = (id: string, postcode: string, price: number): Sale => ({
    id,
    postcode,
    address: id,
    price,
    date: "2026-08-01",
  });

  it("needs at least 3 comparables", () => {
    const comparables = buildComparables(
      [sale("a", "AA1 1AA", 100_000)],
      [{ postcode: "AA1 1AA", distanceMetres: 0 }],
      index,
      now,
    );
    assert.equal(estimateValue(comparables), null);
  });

  it("gives a weighted median with a range around it", () => {
    const comparables = buildComparables(
      [
        sale("a", "AA1 1AA", 300_000),
        sale("b", "AA1 1AA", 310_000),
        sale("c", "AA1 1AA", 320_000),
        sale("d", "AA1 9ZZ", 900_000),
      ],
      [
        { postcode: "AA1 1AA", distanceMetres: 50 },
        { postcode: "AA1 9ZZ", distanceMetres: 1900 },
      ],
      index,
      now,
    );
    const estimate = estimateValue(comparables);

    assert.ok(estimate);
    assert.equal(estimate.value, 310_000);
    assert.equal(estimate.confidence, "low");
    assert.ok(estimate.low < estimate.value && estimate.value < estimate.high);
  });
});
