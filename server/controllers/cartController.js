import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// ADD TO CART
export const addToCartController = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    // Validation
    if (!productId) {
      return res.status(400).send({
        success: false,
        message: "Product ID is required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).send({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Check if product exists and has enough stock
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).send({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // Find or create cart for user
    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      // Create new cart
      cart = new cartModel({
        user: userId,
        cartItems: [],
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      const newQuantity =
        cart.cartItems[existingItemIndex].quantity + parseInt(quantity);

      if (product.stock < newQuantity) {
        return res.status(400).send({
          success: false,
          message: `Cannot add more items. Only ${product.stock} available, you already have ${cart.cartItems[existingItemIndex].quantity} in cart`,
        });
      }

      cart.cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.cartItems.push({
        name: product.name,
        price: product.price,
        quantity: parseInt(quantity),
        image: product.images?.[0] || product.image, // Support multiple images
        product: productId,
      });
    }

    await cart.save();

    res.status(200).send({
      success: true,
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Add to Cart API",
      error: error.message,
    });
  }
};

// GET CART ITEMS
export const getCartController = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await cartModel
      .findOne({ user: userId })
      .populate("cartItems.product", "name price images image stock category");

    if (!cart || cart.cartItems.length === 0) {
      return res.status(200).send({
        success: true,
        message: "Cart is empty",
        cart: {
          cartItems: [],
          totalItems: 0,
          totalAmount: 0,
          user: userId,
        },
      });
    }

    // Check if any products are out of stock
    const updatedCartItems = cart.cartItems.filter((item) => {
      if (!item.product || item.product.stock === 0) {
        return false; // Remove out of stock items
      }

      // Update quantity if it exceeds available stock
      if (item.quantity > item.product.stock) {
        item.quantity = item.product.stock;
      }

      return true;
    });

    // Update cart if items were removed or quantities changed
    if (updatedCartItems.length !== cart.cartItems.length) {
      cart.cartItems = updatedCartItems;
      await cart.save();
    }

    res.status(200).send({
      success: true,
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get Cart API",
      error: error.message,
    });
  }
};

// UPDATE CART ITEM QUANTITY - FIX
export const updateCartItemController = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Debug logs
    console.log("🔍 Update cart request:", {
      productId,
      productIdType: typeof productId,
      quantity,
      userId: userId.toString(),
    });

    if (!productId || quantity === undefined) {
      return res.status(400).send({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).send({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Find cart (WITHOUT populate để có ObjectId thuần)
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      return res.status(404).send({
        success: false,
        message: "Cart not found",
      });
    }

    // Debug current cart items
    console.log(
      "🔍 Current cart items:",
      cart.cartItems.map((item) => ({
        productId: item.product.toString(),
        name: item.name,
        quantity: item.quantity,
      }))
    );

    // Find item index - Ensure both sides are strings
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    console.log("🔍 Item index found:", itemIndex);

    if (itemIndex === -1) {
      return res.status(404).send({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Check stock availability
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).send({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // Update quantity
    cart.cartItems[itemIndex].quantity = parseInt(quantity);
    await cart.save();

    // Return cart WITH populate for frontend consistency
    const updatedCart = await cartModel
      .findOne({ user: userId })
      .populate("cartItems.product", "name price images image stock category");

    res.status(200).send({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.log("❌ Update cart error:", error);
    res.status(500).send({
      success: false,
      message: "Error in Update Cart API",
      error: error.message,
    });
  }
};

// REMOVE FROM CART - FIX
export const removeFromCartController = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Debug logs
    console.log("🔍 Remove cart request:", {
      productId,
      productIdType: typeof productId,
      userId: userId.toString(),
    });

    if (!productId) {
      return res.status(400).send({
        success: false,
        message: "Product ID is required",
      });
    }

    // Find cart (WITHOUT populate để có ObjectId thuần)
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      return res.status(404).send({
        success: false,
        message: "Cart not found",
      });
    }

    // Debug current cart items
    console.log(
      "🔍 Current cart items before remove:",
      cart.cartItems.map((item) => ({
        productId: item.product.toString(),
        name: item.name,
      }))
    );

    const initialLength = cart.cartItems.length;

    // Filter items - Ensure both sides are strings
    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    console.log("🔍 Items after filter:", cart.cartItems.length);

    if (cart.cartItems.length === initialLength) {
      return res.status(404).send({
        success: false,
        message: "Product not found in cart",
      });
    }

    await cart.save();

    // Return cart WITH populate for frontend consistency
    const updatedCart = await cartModel
      .findOne({ user: userId })
      .populate("cartItems.product", "name price images image stock category");

    res.status(200).send({
      success: true,
      message: "Product removed from cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.log("❌ Remove cart error:", error);
    res.status(500).send({
      success: false,
      message: "Error in Remove from Cart API",
      error: error.message,
    });
  }
};

// CLEAR CART
export const clearCartController = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await cartModel.findOneAndUpdate(
      { user: userId },
      {
        cartItems: [],
        totalItems: 0,
        totalAmount: 0,
      },
      { new: true, upsert: true }
    );

    res.status(200).send({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Clear Cart API",
      error: error.message,
    });
  }
};

// GET CART COUNT (for navbar badge)
export const getCartCountController = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await cartModel.findOne({ user: userId });

    const count = cart ? cart.totalItems : 0;

    res.status(200).send({
      success: true,
      count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get Cart Count API",
      error: error.message,
    });
  }
};
