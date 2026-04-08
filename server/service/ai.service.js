import ProductModel from "../models/product.model.js";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// =========================================================
// 🧠 UNIT HANDLER (VERY IMPORTANT)
// =========================================================
const getUnitType = (unit) => {
  if (!unit) return { type: "unit", label: "items" };

  const u = unit.toLowerCase();

  if (u.includes("kg") || u.includes("g"))
    return { type: "weight", label: "kg" };

  if (u.includes("ml") || u.includes("l"))
    return { type: "liquid", label: "liters" };

  if (u.includes("pack"))
    return { type: "pack", label: "packets" };

  return { type: "unit", label: "pieces" };
};

// =========================================================
// 🔥 SEARCH ENGINE (SYNONYMS FIRST)
// =========================================================
const findBestProduct = async (query) => {
  const q = query.toLowerCase().trim();

  // 🥇 SYNONYMS
  let products = await ProductModel.find({
    synonyms: { $in: [q] },
    publish: true,
    stock: { $gt: 0 }
  });

  if (products.length) return products;

  // 🥈 MAIN NAME
  products = await ProductModel.find({
    mainName: q,
    publish: true,
    stock: { $gt: 0 }
  });

  if (products.length) return products;

  // 🥉 AI KEYWORDS
  products = await ProductModel.find({
    ai_keywords: { $in: [q] },
    publish: true,
    stock: { $gt: 0 }
  });

  if (products.length) return products;

  // 🧠 FALLBACK
  const regex = new RegExp(`\\b${q}`, "i");

  return await ProductModel.find({
    $or: [{ name: regex }, { description: regex }],
    publish: true,
    stock: { $gt: 0 }
  });
};

// =========================================================
// 🧠 SAFE PARSE
// =========================================================
const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return null;
    }
  }
};

// =========================================================
// 🧠 MAIN PROCESS
// =========================================================
export const processAI = async ({ message, context = {} }) => {
  try {
    const lower = message.toLowerCase();

    // =========================================================
    // 🔁 SELECT PRODUCT
    // =========================================================
    if (context?.last_action === "select_product") {
      const selected = context.options.find((p) =>
        lower.includes(p.toLowerCase())
      );

      if (!selected) {
        return {
          action: "select_product",
          response: "Please choose one option, sir.",
          context
        };
      }

      const product = await ProductModel.findOne({ name: selected });
      const unitInfo = getUnitType(product.unit);

      return {
        action: "ask_quantity",
        product,
        response: `Great choice 👍 You selected ${product.name}. How many ${unitInfo.label} would you like?`,
        context: {
          last_action: "ask_quantity",
          productId: product._id,
          unitInfo
        }
      };
    }

    // =========================================================
    // 🔁 HANDLE QUANTITY
    // =========================================================
    if (context?.last_action === "ask_quantity") {
      const qty = parseFloat(lower);

      if (!qty || qty <= 0) {
        return {
          action: "ask_quantity",
          response: "Please tell a valid quantity.",
          context
        };
      }

      const product = await ProductModel.findById(context.productId);

      return {
        action: "confirm_add",
        product,
        quantity: qty,
        response: `Perfect 👍 You want ${qty} ${context.unitInfo.label} of ${product.name}. Should I add this to your cart?`,
        context: {
          last_action: "confirm_add",
          productId: product._id,
          quantity: qty,
          unitInfo: context.unitInfo
        }
      };
    }

    // =========================================================
    // 🔁 CONFIRM ADD TO CART
    // =========================================================
    if (context?.last_action === "confirm_add") {
      if (lower.includes("yes")) {
        return {
          action: "add_to_cart",
          response: "Done 👍 Item added to your cart successfully.",
          data: {
            productId: context.productId,
            quantity: context.quantity
          },
          context: {}
        };
      }

      return {
        action: "cancel",
        response: "Okay 👍 I have not added it.",
        context: {}
      };
    }

    // =========================================================
    // 🧠 AI EXTRACT PRODUCT
    // =========================================================
    const prompt = `
Extract product name.

Return JSON:
{
  "product": ""
}

User: "${message}"
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const parsed = safeParse(
      completion.choices[0].message.content
    );

    if (!parsed?.product) {
      return {
        action: "clarify",
        response: "Please tell me what you want to order."
      };
    }

    // =========================================================
    // 🔍 SEARCH
    // =========================================================
    const products = await findBestProduct(parsed.product);

    if (!products.length) {
      return {
        action: "not_found",
        response: `Sorry, ${parsed.product} is not available.`
      };
    }

    // =========================================================
    // 🔁 MULTIPLE
    // =========================================================
    if (products.length > 1) {
      return {
        action: "select_product",
        response: `I found ${products.map(p => p.name).join(", ")}. Which one do you want?`,
        context: {
          last_action: "select_product",
          options: products.map(p => p.name)
        }
      };
    }

    // =========================================================
    // ✅ SINGLE PRODUCT
    // =========================================================
    const product = products[0];
    const unitInfo = getUnitType(product.unit);

    return {
      action: "ask_quantity",
      product,
      response: `Great choice 👍 ${product.name} is available for ₹${product.price}. How many ${unitInfo.label} would you like?`,
      context: {
        last_action: "ask_quantity",
        productId: product._id,
        unitInfo
      }
    };

  } catch (err) {
    console.error(err);
    return {
      action: "error",
      response: "Something went wrong, please try again."
    };
  }
};