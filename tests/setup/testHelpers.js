/**
 * testHelpers.js
 * Shared helper utilities for all test suites.
 * - JWT token factory
 * - Minimal user/material factory functions
 */
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ─────────────────────── JWT helpers ───────────────────────────────────────

/**
 * Generate a signed JWT for a given role (tutor | admin | student)
 * Uses the same secret as the real app.
 */
export const generateToken = (overrides = {}) => {
  const payload = {
    id: overrides.id || new mongoose.Types.ObjectId().toString(),
    role: overrides.role || "tutor",
    email: overrides.email || "test@example.com",
    ...overrides,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || "test_secret_key_12345", {
    expiresIn: "1d",
  });
};

export const tutorToken = () => generateToken({ role: "tutor" });
export const adminToken = () => generateToken({ role: "admin" });
export const studentToken = () => generateToken({ role: "student" });

// ─────────────────────── Data factories ────────────────────────────────────

/**
 * Build a minimal valid study material payload (no file — for unit tests).
 */
export const buildMaterialPayload = (overrides = {}) => ({
  title: "Introduction to Algebra",
  description: "A comprehensive guide to basic algebra concepts for grade 10.",
  subject: "mathematics",
  grade: "10th",
  fileUrl: "https://res.cloudinary.com/demo/raw/upload/v123/study_materials/test.pdf",
  tags: ["algebra", "math", "grade10"],
  status: "active",
  ...overrides,
});

/**
 * Build a minimal valid user object (for mocking req.user).
 */
export const buildUser = (overrides = {}) => {
  const id = overrides._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    userId: id,
    fullName: "Test Tutor",
    email: "tutor@example.com",
    role: "tutor",
    ...overrides,
  };
};
