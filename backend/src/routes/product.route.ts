import express from "express";
import { 
    deleteProduct, 
    getAdminProducts, 
    getAllCategories, 
    getAllProducts, 
    getLatestProducts, 
    getSingleProduct, 
    newProduct, 
    updateProduct 
} from "../controllers/product.controller.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

// Specific routes first
app.post("/new", adminOnly, singleUpload, newProduct);

app.get("/all", getAllProducts);        // Fetch all products

app.get("/latest", getLatestProducts);  // Fetch latest products

app.get("/categories", getAllCategories); // Fetch all categories

app.get("/admin-products", getAdminProducts); // Admin-specific product retrieval

// Dynamic route should come after specific routes
app
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly, singleUpload, updateProduct)  // Only admin can update
  .delete(adminOnly, deleteProduct);            // Only admin can delete

export default app;
