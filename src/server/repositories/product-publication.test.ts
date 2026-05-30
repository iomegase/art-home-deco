import test from "node:test";
import assert from "node:assert/strict";

const { isPublicationStatus } = (await import(
  new URL("./product-publication.repository.ts", import.meta.url).href
)) as typeof import("./product-publication.repository");

test("isPublicationStatus accepts only known statuses", () => {
  assert.equal(isPublicationStatus("draft"), true);
  assert.equal(isPublicationStatus("active"), true);
  assert.equal(isPublicationStatus("archived"), true);
  assert.equal(isPublicationStatus("published"), false);
  assert.equal(isPublicationStatus(""), false);
});
