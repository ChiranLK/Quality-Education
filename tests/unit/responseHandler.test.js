/**
 * UNIT TESTS — utils/responseHandler.js
 *
 * Tests for the centralized response formatting utilities.
 * Pure function tests — no DB, no HTTP.
 */

import { successResponse, errorResponse, paginatedResponse } from "../../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";

// ────────────────────────────────────────────────────────────────────────────
describe("📦 successResponse", () => {
  // ✅ Success — with data
  test("should return a success object with correct shape", () => {
    const response = successResponse("Material retrieved successfully", { title: "Algebra" });
    expect(response.success).toBe(true);
    expect(response.message).toBe("Material retrieved successfully");
    expect(response.data).toEqual({ title: "Algebra" });
    expect(response.timestamp).toBeDefined();
  });

  // ✅ Success — no data
  test("should work with null data (e.g. delete response)", () => {
    const response = successResponse("Study material deleted successfully");
    expect(response.success).toBe(true);
    expect(response.data).toBeNull();
  });

  // 🔲 Edge case — extra meta fields spread correctly
  test("should include extra meta fields when provided", () => {
    const response = successResponse("ok", null, { customField: "abc" });
    expect(response.customField).toBe("abc");
  });
});

// ────────────────────────────────────────────────────────────────────────────
describe("📦 errorResponse", () => {
  // ❌ Error — default status code
  test("should default to 500 status code", () => {
    const response = errorResponse("Internal Server Error");
    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  // ✅ Success — custom status code
  test("should accept a custom status code", () => {
    const response = errorResponse("Not Found", StatusCodes.NOT_FOUND);
    expect(response.statusCode).toBe(404);
    expect(response.success).toBe(false);
  });

  // 🔲 Edge case — include errors array
  test("should attach errors array when provided", () => {
    const errors = ["Title is required", "Grade is required"];
    const response = errorResponse("Validation failed", 400, errors);
    expect(response.errors).toEqual(errors);
  });
});

// ────────────────────────────────────────────────────────────────────────────
describe("📦 paginatedResponse", () => {
  const samplePagination = {
    totalCount: 25,
    totalPages: 3,
    currentPage: 1,
    limit: 10,
  };

  // ✅ Success
  test("should return correct pagination metadata", () => {
    const response = paginatedResponse("Materials retrieved", [], samplePagination);
    expect(response.success).toBe(true);
    expect(response.pagination.total).toBe(25);
    expect(response.pagination.pages).toBe(3);
    expect(response.pagination.current).toBe(1);
    expect(response.pagination.limit).toBe(10);
  });

  // ✅ hasMore flag — true when not on last page
  test("should set hasMore=true when more pages exist", () => {
    const response = paginatedResponse("ok", [], samplePagination);
    expect(response.pagination.hasMore).toBe(true);
  });

  // 🔲 Edge case — last page, hasMore should be false
  test("should set hasMore=false on the last page", () => {
    const lastPagePagination = { ...samplePagination, currentPage: 3 };
    const response = paginatedResponse("ok", [], lastPagePagination);
    expect(response.pagination.hasMore).toBe(false);
  });

  // 🔲 Edge case — empty results
  test("should handle empty data array", () => {
    const response = paginatedResponse("No materials found", [], {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 10,
    });
    expect(response.data).toEqual([]);
    expect(response.pagination.total).toBe(0);
  });
});
