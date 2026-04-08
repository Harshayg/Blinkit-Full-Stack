// server/scripts/dedupeVariants.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js"; // adjust path if model uses different name

dotenv.config();

const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI;

async function run() {
  if (!MONGO) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }
  await mongoose.connect(MONGO, { dbName: process.env.DB_NAME || undefined });
  console.log("Connected to DB");

  const cursor = Product.find().cursor();
  let updated = 0;
  for await (const p of cursor) {
    if (!Array.isArray(p.variants) || p.variants.length <= 1) continue;

    // create a map of unique keys
    const seen = new Map();
    const deduped = [];
    for (const v of p.variants) {
      const key = `${v.unit || ""}::${v.price || 0}::${v.discount || 0}`;
      if (!seen.has(key)) {
        seen.set(key, true);
        deduped.push(v);
      }
    }

    if (deduped.length !== p.variants.length) {
      p.variants = deduped;
      await p.save();
      updated++;
      console.log(`Deduped product ${p._id} -> ${deduped.length} variants`);
    }
  }
  console.log("Done. Updated products:", updated);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
