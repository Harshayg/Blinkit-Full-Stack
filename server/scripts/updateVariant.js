// scripts/updateVariant.js
// Usage: node scripts/updateVariant.js <PRODUCT_ID> <UNIT> <PRICE> <STOCK>

import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";


dotenv.config();

async function run() {
  const [,, productId, unit = "1kg", price = "100", stock = "10"] = process.argv;

  if (!productId) {
    console.error("Usage: node scripts/updateVariant.js <PRODUCT_ID> <UNIT> <PRICE> <STOCK>");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {});

  const variant = {
    unit: String(unit),
    price: Number(price),
    stock: Number(stock),
    discount: 0
  };

  try {
    const res = await Product.updateOne(
      { _id: productId },
      { $push: { variants: variant } }
    );

    console.log("Update result:", res);

    const prod = await Product.findById(productId).lean();
    console.log("Updated Variants:", prod.variants);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
