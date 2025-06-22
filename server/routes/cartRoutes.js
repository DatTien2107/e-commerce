import express from "express";
import { isAuth } from "./../middlewares/authMiddleware.js";
import {
  addToCartController,
  getCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
  getCartCountController,
} from "../controllers/cartController.js";

const router = express.Router();

// ============== CART ROUTES ==================

// ADD TO CART
router.post("/add", isAuth, addToCartController);

// GET CART
router.get("/", isAuth, getCartController);

// GET CART COUNT (for navbar badge)
router.get("/count", isAuth, getCartCountController);

// UPDATE CART ITEM QUANTITY
router.put("/update", isAuth, updateCartItemController);

// REMOVE FROM CART
router.delete("/remove/:productId", isAuth, removeFromCartController);

// CLEAR CART
router.delete("/clear", isAuth, clearCartController);

export default router;
