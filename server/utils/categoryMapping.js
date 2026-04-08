// server/utils/ingredientCategoryMap.js
/**
 * Map normalized ingredient roots -> { categoryName, subCategoryName? }
 * Use names that match your database documents exactly.
 * Expand this map for more ingredients.
 */
export const IngredientCategoryMap = {
  // Staples / grains
  "basmati rice": { categoryName: "Grocery & Staples", subCategoryName: "Rice" },
  "rice": { categoryName: "Grocery & Staples", subCategoryName: "Rice" },
  "atta": { categoryName: "Grocery & Staples", subCategoryName: "Atta" },
  "maida": { categoryName: "Grocery & Staples", subCategoryName: "Besan, Sooji & Maida" },
  "sooji": { categoryName: "Grocery & Staples", subCategoryName: "Besan, Sooji & Maida" },

  // Vegetables
  "onion": { categoryName: "Fruits & Vegetables", subCategoryName: "Onion" },
  "tomato": { categoryName: "Fruits & Vegetables", subCategoryName: "Tomato" },
  "potato": { categoryName: "Fruits & Vegetables", subCategoryName: "Potato" },
  "ginger": { categoryName: "Fruits & Vegetables", subCategoryName: "Ginger" },
  "garlic": { categoryName: "Fruits & Vegetables", subCategoryName: "Garlic" },
  "green chilli": { categoryName: "Fruits & Vegetables", subCategoryName: "Green & Fresh Chillies" },
  "chilli": { categoryName: "Fruits & Vegetables", subCategoryName: "Green & Fresh Chillies" },
  "capsicum": { categoryName: "Fruits & Vegetables", subCategoryName: "Capsicum & Other Vegetables" },
  "coriander": { categoryName: "Fruits & Vegetables", subCategoryName: "Coriander & Herbs" },
  "mint": { categoryName: "Fruits & Vegetables", subCategoryName: "Coriander & Herbs" },
  "lemon": { categoryName: "Fruits & Vegetables", subCategoryName: "Lemon & Seasonal" },

  // Dairy, etc
  "paneer": { categoryName: "Dairy, Bread & Eggs", subCategoryName: "Paneer & Tofu" },
  "tofu": { categoryName: "Dairy, Bread & Eggs", subCategoryName: "Paneer & Tofu" },
  "curd": { categoryName: "Dairy, Bread & Eggs", subCategoryName: "Curd & Yogurt" },
  "yogurt": { categoryName: "Dairy, Bread & Eggs", subCategoryName: "Curd & Yogurt" },
  "milk": { categoryName: "Dairy, Bread & Eggs", subCategoryName: "Milk" },
  "butter": { categoryName: "Dairy, Bread & Eggs", subCategoryName: "Butter & More" },
  "egg": { categoryName: "Dairy, Bread & Eggs", subCategoryName: "Eggs" },

  // Meat / seafood
  "chicken": { categoryName: "Meat & SeaFood", subCategoryName: "Chicken" },
  "fish": { categoryName: "Meat & SeaFood", subCategoryName: "Fish & Seafood" },

  // Oils & masala
  "oil": { categoryName: "Masala, Oil & More" },
  "mustard oil": { categoryName: "Masala, Oil & More" },
  "sunflower oil": { categoryName: "Masala, Oil & More" },
  "ghee": { categoryName: "Masala, Oil & More" },
  "salt": { categoryName: "Masala, Oil & More", subCategoryName: "Herbs & Seasoning" },
  "sugar": { categoryName: "Grocery & Staples", subCategoryName: "Glucose & Marie" },

  // Sauces & spreads
  "ketchup": { categoryName: "Sauces & Spreads" },
  "soy sauce": { categoryName: "Sauces & Spreads" },

  // spices (common)
  "turmeric": { categoryName: "Masala, Oil & More" },
  "cumin": { categoryName: "Masala, Oil & More" },
  "garam masala": { categoryName: "Masala, Oil & More" },

  // synonyms
  "dahi": { categoryName: "Dairy, Bread & Eggs", subCategoryName: "Curd & Yogurt" },
  "curd/yogurt": { categoryName: "Dairy, Bread & Eggs", subCategoryName: "Curd & Yogurt" }

  // Add more mappings over time...
};
