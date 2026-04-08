import { Router } from "express";
import auth from "../middleware/auth.js";
import multer from "../middleware/multer.js"; // your multer config
import {
  AddCategoryController,
  deleteCategoryController,
  getCategoryController,
  updateCategoryController,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.post("/add-category", auth, multer.single("image"), AddCategoryController);
categoryRouter.get("/get", getCategoryController);
categoryRouter.put("/update", auth, multer.single("image"), updateCategoryController);
categoryRouter.delete("/delete", auth, deleteCategoryController);

export default categoryRouter;
