import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import { triggerRestockNotifications } from "./Notification.controller.js";




/* ============================================================
   🧠 HELPER: NORMALIZE MAIN NAME
============================================================ */
const normalizeMainName = (name) => {
  if (!name) return "";
  const stopWords = ["fresh", "big", "small", "premium"];
  const cleaned = name
    .toLowerCase()
    .replace(/\d+\s?(kg|g|gm|ml|l)/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim();
  const words = cleaned.split(" ").filter((w) => !stopWords.includes(w));
  return words[0] || cleaned;
};

/* ============================================================
   CREATE PRODUCT
============================================================ */
export const createProductController = async (request, response) => {
  try {
    const {
      name, image, category, subCategory, unit, stock, price,
      discount, description, more_details, ai_keywords, synonyms,
    } = request.body;

    if (!name || !image?.[0] || !category?.[0] || !subCategory?.[0] || !description) {
      return response.status(400).json({ message: "Enter required fields", error: true, success: false });
    }

    const mainName = normalizeMainName(name);

    const product = new ProductModel({
      name, mainName, image, category, subCategory, unit, stock,
      price, discount, description, more_details,
      ai_keywords: ai_keywords || [],
      synonyms: synonyms || ai_keywords || [],
    });

    const saveProduct = await product.save();
    return response.json({ message: "Product Created Successfully", data: saveProduct, error: false, success: true });
  } catch (error) {
    console.error("Error creating product:", error);
    return response.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

/* ============================================================
   GET ALL PRODUCTS
============================================================ */
export const getProductController = async (request, response) => {
  try {
    let { page, limit } = request.body || {};
    page = Number(page) || 1;
    limit = Number(limit) || 1000;
    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      ProductModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("category subCategory"),
      ProductModel.countDocuments({}),
    ]);

    return response.json({
      message: "Product data", error: false, success: true,
      totalCount, totalNoPage: Math.ceil(totalCount / limit), data,
    });
  } catch (error) {
    return response.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

/* ============================================================
   GET PRODUCT BY CATEGORY
============================================================ */
export const getProductByCategory = async (request, response) => {
  try {
    const { id } = request.body;
    if (!id) return response.status(400).json({ message: "provide category id", error: true, success: false });
    const product = await ProductModel.find({ category: { $in: id } }).limit(15);
    return response.json({ message: "category product list", data: product, error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

/* ============================================================
   GET PRODUCT BY CATEGORY + SUBCATEGORY
============================================================ */
export const getProductByCategoryAndSubCategory = async (request, response) => {
  try {
    let { categoryId, subCategoryId, page = 1, limit = 10 } = request.body;

    if (!categoryId || !subCategoryId) {
      return response.status(400).json({ message: "Provide categoryId and subCategoryId", error: true, success: false });
    }

    const query = {
      category: Array.isArray(categoryId) ? { $in: categoryId } : categoryId,
      subCategory: Array.isArray(subCategoryId) ? { $in: subCategoryId } : subCategoryId,
    };
    const skip = (page - 1) * limit;

    const [data, dataCount] = await Promise.all([
      ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return response.json({ message: "Product list", data, totalCount: dataCount, page, limit, success: true, error: false });
  } catch (error) {
    return response.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

/* ============================================================
   GET PRODUCT DETAILS
============================================================ */
export const getProductDetails = async (request, response) => {
  try {
    const { productId } = request.body;
    const product = await ProductModel.findOne({ _id: productId })
      .populate("category", "name")
      .populate("subCategory", "name");

    if (!product) return response.status(404).json({ message: "Product not found", error: true, success: false });

    return response.json({ message: "Product details fetched successfully", data: product, error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

/* ============================================================
   UPDATE PRODUCT
============================================================ */
export const updateProductDetails = async (request, response) => {
  try {
    const { _id, name } = request.body;
    if (!_id) return response.status(400).json({ message: "Provide product _id", error: true, success: false });

    const existingProduct = await ProductModel.findById(_id);
    const updateData = { ...request.body };
    if (name) updateData.mainName = normalizeMainName(name);

    const updateProduct = await ProductModel.updateOne({ _id }, updateData);

    if (existingProduct?.stock === 0 && updateData.stock !== undefined && updateData.stock > 0) {
      await triggerRestockNotifications(_id);
    }

    return response.json({ message: "Updated successfully", data: updateProduct, error: false, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

/* ============================================================
   DELETE PRODUCT
============================================================ */
export const deleteProductDetails = async (request, response) => {
  try {
    const { _id } = request.body;
    if (!_id) return response.status(400).json({ message: "provide _id", error: true, success: false });
    const deleteProduct = await ProductModel.deleteOne({ _id });
    return response.json({ message: "Delete successfully", error: false, success: true, data: deleteProduct });
  } catch (error) {
    return response.status(500).json({ message: error.message || error, error: true, success: false });
  }
};


/* ============================================================
   SEARCH PRODUCT  ✅ FULLY REWRITTEN
   
   Priority waterfall:
   1. Exact mainName match
   2. Synonym match
   3. ai_keywords match
   4. Name starts-with (safe regex)
   5. Name contains (broad regex) — catches "chocolate chip" when user types "chocolate"
   6. Description contains — catches keyword in product description
   7. MongoDB full-text search (name + ai_keywords weighted index) — catch-all
   
   Each step runs countDocuments first. We use the FIRST step
   that returns results, then paginate that query.
   All steps filter publish:true and stock > 0.
============================================================ */
export const searchProduct = async (req, res) => {
  try {
    let { search, page, limit } = req.body;

    page  = Number(page)  || 1;
    limit = Number(limit) || 12;
    const skip = (page - 1) * limit;

    if (!search || !search.trim()) {
      return res.json({ message: "No search term", data: [], totalCount: 0, success: true, error: false });
    }

    const searchTerm = search.toLowerCase().trim();
    // Escape special regex chars to prevent injection
    const escaped   = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const anywhereR = new RegExp(escaped, "i");            // contains (broad)
    const startsR   = new RegExp(`^${escaped}\\b`, "i");   // starts-with word

    const baseFilter = (extra) => ({
      ...extra,
      publish: true,
      stock: { $gt: 0 },
    });

    // ── waterfall steps (query, label) ────────────────────────
    const steps = [
      {
        label: "exact-mainName",
        query: baseFilter({ mainName: searchTerm }),
      },
      {
        label: "synonyms",
        query: baseFilter({ synonyms: searchTerm }),
      },
      {
        label: "ai_keywords-exact",
        query: baseFilter({ ai_keywords: searchTerm }),
      },
      {
        label: "name-startsWith",
        query: baseFilter({ name: { $regex: startsR } }),
      },
      {
        label: "name-contains",
        query: baseFilter({ name: { $regex: anywhereR } }),
      },
      {
        label: "description-contains",
        query: baseFilter({ description: { $regex: anywhereR } }),
      },
      {
        label: "ai_keywords-contains",
        query: baseFilter({ ai_keywords: { $regex: anywhereR } }),
      },
      {
        label: "text-index",
        // MongoDB full-text — works when text index exists on name + ai_keywords
        query: baseFilter({ $text: { $search: searchTerm } }),
      },
    ];

    let chosenQuery = null;
    let totalCount  = 0;

    for (const step of steps) {
      try {
        const count = await ProductModel.countDocuments(step.query);
        if (count > 0) {
          chosenQuery = step.query;
          totalCount  = count;
          console.log(`[search] hit on step: ${step.label} (${count} docs)`);
          break;
        }
      } catch {
        // text-index step may throw if index doesn't exist — skip it gracefully
        continue;
      }
    }

    if (!chosenQuery || totalCount === 0) {
      return res.json({
        message: "No products found",
        data: [],
        totalCount: 0,
        success: true,
        error: false,
      });
    }

    const products = await ProductModel.find(chosenQuery)
      .populate("category subCategory")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      message: "Search results",
      data: products,
      totalCount,
      totalNoPage: Math.ceil(totalCount / limit),
      page,
      limit,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("searchProduct error:", error);
    return res.status(500).json({ message: "Search failed", error: true, success: false });
  }
};


/* ============================================================
   AUTOCOMPLETE PRODUCT  ✅ FIXED & IMPROVED
   Searches name (starts-with) + ai_keywords + synonyms
============================================================ */
export const autocompleteProduct = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({ message: "Query too short", data: [], success: true, error: false });
    }

    const escaped  = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const startsR  = new RegExp(`^${escaped}`, "i");
    const containsR = new RegExp(escaped, "i");

    // Union: name starts-with OR ai_keywords contains OR synonyms contains
    const products = await ProductModel.find({
      $or: [
        { name: { $regex: startsR } },
        { ai_keywords: { $regex: containsR } },
        { synonyms: { $regex: containsR } },
      ],
      publish: true,
      stock: { $gt: 0 },
    })
      .select("name image price discount unit")
      .limit(8);

    return res.json({ message: "Autocomplete results", data: products, success: true, error: false });
  } catch (error) {
    console.error("autocompleteProduct error:", error);
    return res.status(500).json({ message: "Autocomplete failed", error: true, success: false });
  }
};