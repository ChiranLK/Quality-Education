/**
 * generate-perf-token.js
 *
 * Utility script to generate a valid JWT for performance testing.
 * Run BEFORE artillery tests to get a fresh token.
 *
 * Usage:
 *   node tests/performance/generate-perf-token.js
 */
import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Reuse a real user id from your DB, or generate a fake ObjectId
const testUserId = new mongoose.Types.ObjectId().toString();

const token = jwt.sign(
  {
    id: testUserId,
    role: "student",
    email: "perf-test@university.lk",
  },
  process.env.JWT_SECRET || "test_secret_key_12345",
  { expiresIn: "2h" }
);

console.log("\n🔑 Performance Test JWT Token:");
console.log("─".repeat(60));
console.log(token);
console.log("─".repeat(60));
console.log("\n✅ Copy the token above into tests/performance/study-material-load-test.yml");
console.log("   Replace the value of: authToken: \"REPLACE_WITH_VALID_JWT_TOKEN\"\n");
