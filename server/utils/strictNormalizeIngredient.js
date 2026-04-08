// server/utils/strictNormalizeIngredient.js

export function strictNormalizeIngredient(raw) {
  if (!raw) return { normalized: "", tokens: [] };

  let cleaned = raw.toString().toLowerCase().trim();

  // remove numbers, units, quantities
  cleaned = cleaned
    .replace(/[0-9]+/g, "")
    .replace(/kg|g|gram|grams|ml|l|litre|cup|cups|tsp|tbsp|piece|pieces/gi, "")
    .replace(/[^a-zA-Z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter(Boolean);

  // strict tokens = must exist in product name
  const tokens = words.filter(w => w.length >= 3);

  return {
    normalized: cleaned,
    tokens
  };
}
