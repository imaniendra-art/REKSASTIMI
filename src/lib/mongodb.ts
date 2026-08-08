import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI belum diatur di environment.");
}

const mongoUri = MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null
};

globalForMongoose.mongooseCache = cached;

export async function connectMongoDB() {
  if (cached.conn) {
    return cached.conn;
  }

  try {
    cached.promise ??= mongoose.connect(mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000
    });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    const target = mongoUri.includes("127.0.0.1") || mongoUri.includes("localhost") ? "MongoDB lokal" : "MongoDB Atlas";
    throw new Error(`Gagal terhubung ke ${target}. Periksa MONGODB_URI di file .env dan whitelist IP Atlas.`);
  }
}
