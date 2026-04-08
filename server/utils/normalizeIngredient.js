// utils/normalizeIngredient.js
/**
 * Improved normalizeIngredient:
 * - strips quantities (including unicode fractions), units, bracketed text
 * - strips common descriptors (chopped, finely, peeled, etc.)
 * - naive singularization (onions -> onion, potatoes -> potato)
 * - returns a multi-word normalized phrase (joins cleaned tokens) so "basmati rice" stays together
 *
 * Returns: { original, normalized, tokens }
 */

const UNIT_WORDS = new Set([
  "kg","g","gm","gram","grams","kilogram","kilograms",
  "l","ltr","liter","litre","ml","cup","cups","cupful","tablespoon","tablespoons","tbsp","tbs","tsp","teaspoon","teaspoons",
  "piece","pieces","pcs","pc","packet","packets","slice","slices","bunch","bunches","pinch","clove","cloves","kg.","g.","ml."
]);

const DESCRIPTORS = new Set([
  "medium","large","small","finely","coarsely","chopped","chop","sliced","slice","minced","diced","grated","ground",
  "fresh","freshly","roasted","boiled","fried","thinly","roughly","peeled","crushed","softened","warm","cold","optional",
  "to","taste","optional","washed","drained","julienne","shredded","blanched","beaten"
]);

const STOP_WORDS = new Set([
  "and","or","of","in","for","to","with","a","an","the","by","into","as","on","about"
]);

// Map some irregular plurals (extendable)
const IRREGULARS = {
  "potatoes": "potato",
  "tomatoes": "tomato",
  "leaves": "leaf",
  "children": "child",
  "feet": "foot"
};

function simpleSingular(word) {
  if (!word) return word;
  if (IRREGULARS[word]) return IRREGULARS[word];
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y"; // berries -> berry
  if (word.endsWith("oes") && word.length > 3) return word.slice(0, -2); // potatoes-ish
  if ((word.endsWith("ses") || word.endsWith("xes") || word.endsWith("zes")) && word.length > 3) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) return word.slice(0, -1);
  return word;
}

function removeBrackets(s) {
  return s.replace(/\([^)]*\)/g, " ");
}

function removeUnicodeFractions(s) {
  // remove characters like ½ ¼ ¾ etc by spacing them out, then strip numbers
  return s.replace(/[\u00BC-\u00BE\u2150-\u215E]/g, " ");
}

function removeQuantityPatterns(s) {
  // remove mixed fractions like "1 1/2", "1/2", "2-3", "2–3" (ndash), "2–3 cups"
  s = s.replace(/\b\d+\s+[0-9]+\s*\/\s*[0-9]+\b/g, " "); // "1 1/2"
  s = s.replace(/\b\d+\s*\/\s*\d+\b/g, " "); // "1/2"
  s = s.replace(/\b\d+(\.\d+)?\s*-\s*\d+(\.\d+)?\b/g, " "); // "2-3"
  s = s.replace(/\b\d+(\.\d+)?\b/g, " "); // standalone numbers like "2", "3.5"
  return s;
}

function stripUnits(s) {
  // remove tokens that are exactly units or units attached to numbers like "200g" already mostly handled but keep safety
  return s.replace(/\b\d+(g|kg|ml|ltr|l|cup|cups|tbsp|tsp|pcs|pc)\b/ig, " ");
}

export function normalizeIngredient(raw) {
  const original = (raw || "").toString().trim();
  if (!original) return { original, normalized: "", tokens: [] };

  // 1) remove bracketed content and unicode fractions and quantities
  let s = original;
  s = removeBrackets(s);
  s = removeUnicodeFractions(s);
  s = stripUnits(s);
  s = removeQuantityPatterns(s);

  // 2) normalize punctuation to spaces
  s = s.replace(/[.,:;!?\u2013\u2014\-–—]/g, " ");

  // 3) lowercase
  s = s.toLowerCase();

  // 4) split into words, trim
  let parts = s.split(/\s+/).map(p => p.trim()).filter(Boolean);

  // 5) filter out units, descriptors, and stopwords
  parts = parts.filter(p => {
    if (!p) return false;
    if (UNIT_WORDS.has(p)) return false;
    if (DESCRIPTORS.has(p)) return false;
    if (STOP_WORDS.has(p)) return false;
    // remove stray tokens of single char or punctuation
    if (p.length <= 1) return false;
    // remove tokens that are purely punctuation or digits
    if (/^[^a-z]+$/.test(p)) return false;
    return true;
  });

  // 6) simple singularize each token
  const singular = parts.map(simpleSingular);

  // 7) unique tokens preserving order
  const seen = new Set();
  const uniq = [];
  for (const t of singular) {
    if (!seen.has(t)) {
      seen.add(t);
      uniq.push(t);
    }
  }

  // 8) Build normalized phrase:
  // Prefer to keep multi-word noun phrases intact (e.g. "basmati rice", "red onion")
  // Join up to first 3 tokens (most ingredients are short). If tokens include adjectives + noun, this keeps them.
  const normalized = uniq.slice(0, 3).join(" ").trim();

  // 9) tokens returned for overlap scoring: keep the uniq array
  return { original, normalized, tokens: uniq };
}
