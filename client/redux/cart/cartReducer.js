// redux/cart/cartReducer.js
import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  cart: {
    cartItems: [],
    totalItems: 0,
    totalAmount: 0,
    user: null,
  },
  cartCount: 0,
  loading: false,
  error: null,
  message: null,

  // Specific loading states
  addToCartLoading: false,
  updateCartLoading: false,
  removeFromCartLoading: false,
  clearCartLoading: false,
  getCartLoading: false,
  getCartCountLoading: false,
};

export const cartReducer = createReducer(initialState, (builder) => {
  // ADD TO CART
  builder.addCase("addToCartRequest", (state) => {
    state.addToCartLoading = true;
    state.loading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("addToCartSuccess", (state, action) => {
    state.addToCartLoading = false;
    state.loading = false;
    state.cart = action.payload.cart;
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("addToCartFail", (state, action) => {
    state.addToCartLoading = false;
    state.loading = false;
    state.error = action.payload;
    state.message = null;
  });

  // GET CART
  builder.addCase("getCartRequest", (state) => {
    state.getCartLoading = true;
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getCartSuccess", (state, action) => {
    state.getCartLoading = false;
    state.loading = false;
    state.cart = action.payload.cart;
    state.error = null;
  });
  builder.addCase("getCartFail", (state, action) => {
    state.getCartLoading = false;
    state.loading = false;
    state.error = action.payload;
  });

  // UPDATE CART ITEM
  builder.addCase("updateCartItemRequest", (state) => {
    state.updateCartLoading = true;
    state.loading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("updateCartItemSuccess", (state, action) => {
    state.updateCartLoading = false;
    state.loading = false;
    state.cart = action.payload.cart;
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("updateCartItemFail", (state, action) => {
    state.updateCartLoading = false;
    state.loading = false;
    state.error = action.payload;
    state.message = null;
  });

  // REMOVE FROM CART
  builder.addCase("removeFromCartRequest", (state) => {
    state.removeFromCartLoading = true;
    state.loading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("removeFromCartSuccess", (state, action) => {
    state.removeFromCartLoading = false;
    state.loading = false;
    state.cart = action.payload.cart;
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("removeFromCartFail", (state, action) => {
    state.removeFromCartLoading = false;
    state.loading = false;
    state.error = action.payload;
    state.message = null;
  });

  // CLEAR CART
  builder.addCase("clearCartRequest", (state) => {
    state.clearCartLoading = true;
    state.loading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("clearCartSuccess", (state, action) => {
    state.clearCartLoading = false;
    state.loading = false;
    state.cart = action.payload.cart;
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("clearCartFail", (state, action) => {
    state.clearCartLoading = false;
    state.loading = false;
    state.error = action.payload;
    state.message = null;
  });

  // GET CART COUNT
  builder.addCase("getCartCountRequest", (state) => {
    state.getCartCountLoading = true;
  });
  builder.addCase("getCartCountSuccess", (state, action) => {
    state.getCartCountLoading = false;
    state.cartCount = action.payload;
  });
  builder.addCase("getCartCountFail", (state, action) => {
    state.getCartCountLoading = false;
    state.cartCount = action.payload; // Will be 0
  });

  // CLEAR ERRORS AND MESSAGES
  builder.addCase("clearCartErrors", (state) => {
    state.error = null;
  });
  builder.addCase("clearCartMessages", (state) => {
    state.message = null;
  });

  // RESET CART (when logout or auth error)
  builder.addCase("resetCart", (state) => {
    return initialState;
  });
});
