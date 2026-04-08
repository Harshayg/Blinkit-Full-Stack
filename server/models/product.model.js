import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // 🔥 MAIN SEARCH FIELD (MOST IMPORTANT)
    mainName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true, // ✅ KEEP ONLY THIS (removed duplicate below)
    },

    image: { type: Array, default: [] },

    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "category",
      },
    ],

    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
      },
    ],

    unit: { type: String, default: "" },
    stock: { type: Number, default: null },
    price: { type: Number, default: null },
    discount: { type: Number, default: null },

    description: { type: String, default: "" },
    more_details: { type: Object, default: {} },

    publish: { type: Boolean, default: true },

    // 🔥 AI SUPPORT
    ai_keywords: {
      type: [String],
      default: [],
    },

    // 🔥 SYNONYMS (VERY IMPORTANT FOR VOICE SEARCH)
    synonyms: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// =========================================================
// 🔍 INDEXES (FAST SEARCH)
// =========================================================

// ❌ REMOVED duplicate: productSchema.index({ mainName: 1 });

// 🔥 TEXT SEARCH (backup search)
productSchema.index(
  {
    name: "text",
    ai_keywords: "text",
  },
  {
    weights: {
      name: 10,
      ai_keywords: 8,
    },
  }
);

const ProductModel = mongoose.model("product", productSchema);

export default ProductModel;