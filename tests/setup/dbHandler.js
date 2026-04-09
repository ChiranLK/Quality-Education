/**
 * dbHandler.js
 * MongoDB Memory Server helpers for integration tests.
 * Provides connect / close / clear utilities so tests
 * never touch the real production/staging database.
 */
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

/**
 * Start an in-memory MongoDB instance and connect Mongoose to it.
 */
export const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

/**
 * Drop every collection — call between test suites for isolation.
 */
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Close the connection and stop the in-memory server.
 */
export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};
