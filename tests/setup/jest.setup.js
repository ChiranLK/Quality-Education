/**
 * jest.setup.js
 * Runs before every test file.
 * Loads .env.test so process.env vars are available to all tests.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
