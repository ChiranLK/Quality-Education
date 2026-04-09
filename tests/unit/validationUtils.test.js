/**
 * UNIT TESTS — utils/validationUtils.js
 *
 * Tests for all pure validation & sanitization utility functions.
 * No DB, no Express — pure function testing.
 */

import mongoose from "mongoose";
import { jest } from "@jest/globals";

// ─── Manually recreate the pure functions so we don't need DB boot ──────────
// (if ES module mocking is not available these inline copies work the same way)

import { validateObjectId, sanitizeMimeType, isFileTypeAllowed, isValidEmail, sanitizeInput } from "../../utils/validationUtils.js";
import { BadRequestError } from "../../errors/customErrors.js";

// ────────────────────────────────────────────────────────────────────────────
describe("🔧 validateObjectId", () => {
  // ✅ Success
  test("should return the id for a valid MongoDB ObjectId", () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const result = validateObjectId(validId);
    expect(result).toBe(validId);
  });

  // ❌ Error
  test("should throw BadRequestError for an invalid id string", () => {
    expect(() => validateObjectId("not-an-id")).toThrow(BadRequestError);
    expect(() => validateObjectId("not-an-id")).toThrow(/Invalid ID format/i);
  });

  // 🔲 Edge case — empty string
  test("should throw BadRequestError for an empty string", () => {
    expect(() => validateObjectId("")).toThrow(BadRequestError);
  });

  // 🔲 Edge case — numeric string
  test("should throw BadRequestError for a numeric string", () => {
    expect(() => validateObjectId("12345")).toThrow(BadRequestError);
  });
});

// ────────────────────────────────────────────────────────────────────────────
describe("🔧 sanitizeMimeType", () => {
  // ✅ Success
  test("should return lowercase trimmed MIME type", () => {
    expect(sanitizeMimeType("application/pdf")).toBe("application/pdf");
    expect(sanitizeMimeType("IMAGE/JPEG")).toBe("image/jpeg");
  });

  // 🔲 Edge case — MIME with charset param
  test("should strip charset portion", () => {
    expect(sanitizeMimeType("text/html; charset=utf-8")).toBe("text/html");
  });

  // ❌ Error — null/undefined
  test("should return empty string for null or undefined", () => {
    expect(sanitizeMimeType(null)).toBe("");
    expect(sanitizeMimeType(undefined)).toBe("");
  });
});

// ────────────────────────────────────────────────────────────────────────────
describe("🔧 isFileTypeAllowed", () => {
  const allowed = ["pdf", "docx", "png", "jpeg", "jpg"];

  // ✅ Success
  test("should return true for an allowed extension", () => {
    expect(isFileTypeAllowed("lecture_notes.pdf", allowed)).toBe(true);
    expect(isFileTypeAllowed("diagram.PNG", allowed)).toBe(true); // case insensitive
  });

  // ❌ Error
  test("should return false for a disallowed extension", () => {
    expect(isFileTypeAllowed("virus.exe", allowed)).toBe(false);
    expect(isFileTypeAllowed("script.js", allowed)).toBe(false);
  });

  // 🔲 Edge case — no extension
  test("should return false when filename has no extension", () => {
    expect(isFileTypeAllowed("README", allowed)).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
describe("🔧 isValidEmail", () => {
  // ✅ Success
  test("should return true for valid email formats", () => {
    expect(isValidEmail("student@university.lk")).toBe(true);
    expect(isValidEmail("tutor.name+tag@gmail.com")).toBe(true);
  });

  // ❌ Error
  test("should return false for invalid emails", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("@missing-local.com")).toBe(false);
    expect(isValidEmail("missing-domain@")).toBe(false);
  });

  // 🔲 Edge case — empty string
  test("should return false for empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
describe("🔧 sanitizeInput", () => {
  // ✅ Success
  test("should trim leading/trailing whitespace", () => {
    expect(sanitizeInput("  hello world  ")).toBe("hello world");
  });

  // ❌ Error — NoSQL injection characters
  test("should strip $ { } \\ injection characters", () => {
    const malicious = '{"$gt": ""}';
    const result = sanitizeInput(malicious);
    expect(result).not.toContain("$");
    expect(result).not.toContain("{");
    expect(result).not.toContain("}");
  });

  // 🔲 Edge case — non-string input passes through unchanged
  test("should return non-string values unchanged", () => {
    expect(sanitizeInput(42)).toBe(42);
    expect(sanitizeInput(null)).toBe(null);
  });
});
