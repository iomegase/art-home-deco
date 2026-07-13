import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_PRODUCTS_PAGE_SIZE,
  getAdminProductsPaginationItems,
  getAdminProductsPaginationState,
} from "./admin-product-pagination.ts";

test("271 products are split into ten pages of thirty", () => {
  assert.deepEqual(getAdminProductsPaginationState(271, 1), {
    currentPage: 1,
    totalPages: 10,
    startIndex: 0,
    endIndex: 30,
  });
  assert.equal(ADMIN_PRODUCTS_PAGE_SIZE, 30);
});

test("the last page contains the final product", () => {
  assert.deepEqual(getAdminProductsPaginationState(271, 10), {
    currentPage: 10,
    totalPages: 10,
    startIndex: 270,
    endIndex: 271,
  });
});

test("requested pages are clamped and an empty result keeps one logical page", () => {
  assert.equal(getAdminProductsPaginationState(271, 99).currentPage, 10);
  assert.deepEqual(getAdminProductsPaginationState(0, 4), {
    currentPage: 1,
    totalPages: 1,
    startIndex: 0,
    endIndex: 0,
  });
});

test("pagination items keep current neighbours and boundary pages", () => {
  assert.deepEqual(getAdminProductsPaginationItems(17, 9), [
    1,
    "ellipsis-start",
    8,
    9,
    10,
    "ellipsis-end",
    17,
  ]);
  assert.deepEqual(getAdminProductsPaginationItems(3, 1), [1, 2, 3]);
});
