import { Router } from 'express'
import {
  createProductController,
  deleteProductDetails,
  getProductByCategory,
  getProductByCategoryAndSubCategory,
  getProductController,
  getProductDetails,
  searchProduct,
  autocompleteProduct,   // ✅ NEW
  updateProductDetails,
} from '../controllers/product.controller.js'

const productRouter = Router()

productRouter.post("/create", createProductController)
productRouter.post('/get', getProductController)
productRouter.post("/get-product-by-category", getProductByCategory)
productRouter.post('/get-product-by-category-and-subcategory', getProductByCategoryAndSubCategory)
productRouter.post('/get-product-details', getProductDetails)

// update product
productRouter.put('/update-product-details', updateProductDetails)

// delete product
productRouter.delete('/delete-product', deleteProductDetails)

// ✅ FIX 1: Route was registered as /search but SummaryApi called /search-product
productRouter.post('/search-product', searchProduct)

// ✅ FIX 2: Autocomplete route was missing entirely
productRouter.get('/autocomplete-product', autocompleteProduct)

export default productRouter