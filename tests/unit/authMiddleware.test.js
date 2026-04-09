/**
 * UNIT TESTS — Middleware/authMiddleware.js
 *
 * Tests for protect and authorizePermissions.
 * Strategy: spy on jwt.verify directly (no ESM mock needed),
 * and mock User.findById per test.
 *
 * Covers:
 *  ✅ protect — valid token attaches user to req
 *  ❌ protect — no token, invalid token, user not found
 *  ✅ authorizePermissions — allowed role passes
 *  ❌ authorizePermissions — disallowed role throws
 */
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Auto-mock the User model
jest.mock("../../models/UserModel.js");

import User from "../../models/UserModel.js";
import { protect, authorizePermissions } from "../../Middleware/authMiddleware.js";
import { UnauthenticatedError, UnauthorizedError } from "../../errors/customErrors.js";

// ─── Mock Express req/res/next ─────────────────────────────────────────────
const mockNext = jest.fn();
const mockRes = {};

const buildReq = (token) => ({
  headers: { authorization: token ? `Bearer ${token}` : "" },
  cookies: {},
});

// ════════════════════════════════════════════════════════════════════════════
//  protect
// ════════════════════════════════════════════════════════════════════════════
describe("🔐 protect middleware", () => {
  let jwtVerifySpy;

  const userId = new mongoose.Types.ObjectId().toString();
  const validPayload = { id: userId, role: "tutor", email: "tutor@test.com" };
  const fakeUser = { _id: userId, email: "tutor@test.com", role: "tutor" };

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on jwt.verify so we can control its return value per test
    jwtVerifySpy = jest.spyOn(jwt, "verify");
  });

  afterEach(() => {
    jwtVerifySpy.mockRestore();
  });

  // ✅ Success — valid token, user found in DB
  test("should attach user to req and call next() for a valid token", async () => {
    jwtVerifySpy.mockReturnValue(validPayload);
    User.findById = jest.fn().mockResolvedValue(fakeUser);

    const req = buildReq("valid.token.here");
    await protect(req, mockRes, mockNext);

    expect(req.user).toEqual(fakeUser);
    expect(mockNext).toHaveBeenCalledWith(); // no error argument
  });

  // ❌ Error — no authorization header
  test("should throw UnauthenticatedError when no token is provided", async () => {
    const req = buildReq(null);
    await expect(protect(req, mockRes, mockNext)).rejects.toThrow(UnauthenticatedError);
  });

  // ❌ Error — valid token but user deleted from DB
  test("should throw UnauthenticatedError when user no longer exists in DB", async () => {
    jwtVerifySpy.mockReturnValue(validPayload);
    User.findById = jest.fn().mockResolvedValue(null);

    const req = buildReq("valid.token.here");
    await expect(protect(req, mockRes, mockNext)).rejects.toThrow(UnauthenticatedError);
  });

  // ❌ Error — jwt.verify throws (expired or tampered token)
  test("should throw UnauthenticatedError when JWT verification fails", async () => {
    jwtVerifySpy.mockImplementation(() => { throw new Error("jwt expired"); });

    const req = buildReq("expired.or.tampered.token");
    await expect(protect(req, mockRes, mockNext)).rejects.toThrow(UnauthenticatedError);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  authorizePermissions
// ════════════════════════════════════════════════════════════════════════════
describe("🛡️ authorizePermissions middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  // ✅ Success — role in allowed list
  test("should call next() when user role is in the permitted list", () => {
    const req = { user: { role: "tutor" } };
    const middleware = authorizePermissions("tutor", "admin");
    middleware(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(); // called with no error
  });

  // ✅ Success — admin role allowed
  test("should call next() for admin role", () => {
    const req = { user: { role: "admin" } };
    const middleware = authorizePermissions("tutor", "admin");
    middleware(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  // ❌ Error — student on a tutor-only route
  test("should throw UnauthorizedError when student requests a tutor-only route", () => {
    const req = { user: { role: "student" } };
    const middleware = authorizePermissions("tutor", "admin");
    expect(() => middleware(req, mockRes, mockNext)).toThrow(UnauthorizedError);
  });

  // 🔲 Edge case — empty roles list denies everyone
  test("should deny access when no roles are specified", () => {
    const req = { user: { role: "admin" } };
    const middleware = authorizePermissions(); // no roles
    expect(() => middleware(req, mockRes, mockNext)).toThrow(UnauthorizedError);
  });
});
