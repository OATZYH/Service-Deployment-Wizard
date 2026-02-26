import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const options = {};

// Singleton pattern for Next.js (avoid re-creating clients on HMR)
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const clientPromise: Promise<MongoClient> = (() => {
  if (!uri) {
    // Return a lazy promise that throws only when actually awaited
    return Promise.reject(
      new Error("MONGODB_URI environment variable is not set")
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalForMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalForMongo._mongoClientPromise = client.connect();
    }
    return globalForMongo._mongoClientPromise;
  }

  const client = new MongoClient(uri, options);
  return client.connect();
})();

// Prevent unhandled rejection when URI is not set but module is imported
clientPromise.catch(() => {});

export default clientPromise;
