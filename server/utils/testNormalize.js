import { normalizeIngredient } from "./normalizeIngredient.js";

const tests = [
  "2 cups basmati rice",
  "1 kg Chicken (cut into pieces)",
  "½ tsp turmeric powder",
  "250 ml milk",
  "2-3 green chillies",
  "1 packet biryani masala",
];

console.log("=== Normalization Test ===\n");

for (const t of tests) {
  console.log(`${t}   =>   ${normalizeIngredient(t)}`);
}
