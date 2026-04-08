// server/tools/listCategories.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import CategoryModel from "../models/category.model.js";

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ ERROR: MONGODB_URL not found in .env file");
      process.exit(1);
    }

    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Connected!");
    console.log("📦 Fetching categories...\n");

    const categories = await CategoryModel.find().lean();

    if (!categories.length) {
      console.log("⚠ No categories found.");
      process.exit(0);
    }

    console.log("===== CATEGORY LIST =====");
    categories.forEach((c) => {
      console.log(`Name: ${c.name}`);
      console.log(`ID:   ${c._id}`);
      console.log("---------------------------");
    });

    console.log("🎉 Done!");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

run();
