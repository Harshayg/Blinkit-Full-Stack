import dotenv from "dotenv";
dotenv.config();

let groqClient = null;

const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

// ===============================
// INIT GROQ
// ===============================
async function getGroq() {
  if (groqClient) return groqClient;
  const Groq = (await import("groq-sdk")).default;
  groqClient = new Groq({ apiKey: GROQ_KEY });
  return groqClient;
}

// ===============================
// NORMALIZE TEXT
// ===============================
const normalize = (text) =>
  text?.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim() || "";

// ===============================
// MATCH PRODUCTS USING SYNONYMS
// ── Only returns products that:
//    • actually exist in allProducts
//    • have a non-null price
//    • are not duplicated
// ===============================
export const matchProductsFromAI = (names, allProducts) => {
  if (!Array.isArray(names) || !Array.isArray(allProducts)) return [];

  // Pre-filter allProducts to only those with a valid price
  const validProducts = allProducts.filter(
    (p) => p && p._id && p.price != null
  );

  const results = [];
  const seenIds = new Set();

  for (const aiName of names) {
    if (!aiName || typeof aiName !== "string") continue;

    const n = normalize(aiName);
    if (!n) continue;

    const found = validProducts.find((p) => {
      const fields = [
        p.name,
        p.mainName,
        ...(Array.isArray(p.ai_keywords) ? p.ai_keywords : []),
        ...(Array.isArray(p.synonyms) ? p.synonyms : []),
      ]
        .filter(Boolean)
        .map(normalize);

      return fields.some(
        (f) => f && (f.includes(n) || n.includes(f))
      );
    });

    if (found) {
      const id = String(found._id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        results.push(found);
      }
    }
  }

  return results;
};

// ===============================
// PRODUCT RECOMMENDATION (AI)
// ===============================
export const getAIProductRecommendations = async (product, allProducts) => {
  try {
    if (!product || !Array.isArray(allProducts) || allProducts.length === 0) {
      return [];
    }

    const groq = await getGroq();

    // Only send names of products that have a valid price — avoids
    // Groq being primed with names of broken/incomplete products.
    const validNames = allProducts
      .filter((p) => p && p.name && p.price != null)
      .map((p) => p.name);

    if (validNames.length === 0) return [];

    const prompt = `
You are an AI grocery recommendation system.

User is viewing:
${product.name}

Available products (ONLY suggest from this list, do NOT invent new names):
${validNames.join(", ")}

Suggest 8 relevant or complementary products from the list above.

Return ONLY valid JSON with no extra text:
{
  "recommendations": ["name1", "name2"]
}
`;

    const res = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const text = res.choices?.[0]?.message?.content || "{}";

    // Strip any markdown fences Groq may wrap around the JSON
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
  } catch (error) {
    console.error("getAIProductRecommendations error:", error.message);
    return [];
  }
};

// ===============================
// CART RECOMMENDATION (AI)
// ===============================
export const getAICartRecommendations = async (cartProducts, allProducts) => {
  try {
    if (!Array.isArray(cartProducts) || !Array.isArray(allProducts)) return [];

    // Guard: filter out any null/undefined cart products
    const validCart = cartProducts.filter((p) => p && p.name && p.price != null);
    if (validCart.length === 0) return [];

    const groq = await getGroq();

    const cartNames = validCart.map((p) => p.name).join(", ");

    // Only send names of products that have a valid price
    const validNames = allProducts
      .filter((p) => p && p.name && p.price != null)
      .map((p) => p.name);

    if (validNames.length === 0) return [];

    const prompt = `
User cart contains:
${cartNames}

Available products (ONLY suggest from this list, do NOT invent new names):
${validNames.join(", ")}

Suggest 8 missing or complementary grocery products from the list above.

Return ONLY valid JSON with no extra text:
{
  "recommendations": ["name1", "name2"]
}
`;

    const res = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const text = res.choices?.[0]?.message?.content || "{}";

    // Strip any markdown fences Groq may wrap around the JSON
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
  } catch (error) {
    console.error("getAICartRecommendations error:", error.message);
    return [];
  }
};