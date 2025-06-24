// redux/features/adminProductReducer.js
import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  // Loading states
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  imageLoading: false,

  // Data
  adminProducts: [],
  totalAdminProducts: 0,

  // Messages and errors
  error: null,
  message: null,

  // Success flags
  isCreated: false,
  isUpdated: false,
  isDeleted: false,
  isImageUpdated: false,
  isImageDeleted: false,
};

export const adminProductReducer = createReducer(initialState, (builder) => {
  // ============== GET ALL PRODUCTS FOR ADMIN ==============
  builder.addCase("getAllProductsAdminRequest", (state) => {
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getAllProductsAdminSuccess", (state, action) => {
    state.loading = false;
    state.adminProducts = action.payload.products;
    state.totalAdminProducts = action.payload.totalProducts;
    state.message = action.payload.message;
  });
  builder.addCase("getAllProductsAdminFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.adminProducts = [];
  });

  // ============== CREATE PRODUCT ==============
  builder.addCase("createProductRequest", (state) => {
    state.createLoading = true;
    state.error = null;
    state.isCreated = false;
  });
  builder.addCase("createProductSuccess", (state, action) => {
    state.createLoading = false;
    state.message = action.payload.message;
    state.isCreated = true;
  });
  builder.addCase("createProductFail", (state, action) => {
    state.createLoading = false;
    state.error = action.payload;
    state.isCreated = false;
  });

  // ============== UPDATE PRODUCT ==============
  builder.addCase("updateProductRequest", (state) => {
    state.updateLoading = true;
    state.error = null;
    state.isUpdated = false;
  });
  builder.addCase("updateProductSuccess", (state, action) => {
    state.updateLoading = false;
    state.message = action.payload.message;
    state.isUpdated = true;
  });
  builder.addCase("updateProductFail", (state, action) => {
    state.updateLoading = false;
    state.error = action.payload;
    state.isUpdated = false;
  });

  // ============== DELETE PRODUCT ==============
  builder.addCase("deleteProductRequest", (state) => {
    state.deleteLoading = true;
    state.error = null;
    state.isDeleted = false;
  });
  builder.addCase("deleteProductSuccess", (state, action) => {
    state.deleteLoading = false;
    state.message = action.payload.message;
    state.isDeleted = true;
    // Remove deleted product from adminProducts array
    state.adminProducts = state.adminProducts.filter(
      (product) => product._id !== action.payload.productId
    );
    state.totalAdminProducts = state.totalAdminProducts - 1;
  });
  builder.addCase("deleteProductFail", (state, action) => {
    state.deleteLoading = false;
    state.error = action.payload;
    state.isDeleted = false;
  });

  // ============== UPDATE PRODUCT IMAGE ==============
  builder.addCase("updateProductImageRequest", (state) => {
    state.imageLoading = true;
    state.error = null;
    state.isImageUpdated = false;
  });
  builder.addCase("updateProductImageSuccess", (state, action) => {
    state.imageLoading = false;
    state.message = action.payload.message;
    state.isImageUpdated = true;
  });
  builder.addCase("updateProductImageFail", (state, action) => {
    state.imageLoading = false;
    state.error = action.payload;
    state.isImageUpdated = false;
  });

  // ============== DELETE PRODUCT IMAGE ==============
  builder.addCase("deleteProductImageRequest", (state) => {
    state.imageLoading = true;
    state.error = null;
    state.isImageDeleted = false;
  });
  builder.addCase("deleteProductImageSuccess", (state, action) => {
    state.imageLoading = false;
    state.message = action.payload.message;
    state.isImageDeleted = true;
  });
  builder.addCase("deleteProductImageFail", (state, action) => {
    state.imageLoading = false;
    state.error = action.payload;
    state.isImageDeleted = false;
  });

  // ============== CLEAR ERRORS AND MESSAGES ==============
  builder.addCase("clearAdminProductErrors", (state) => {
    state.error = null;
  });
  builder.addCase("clearAdminProductMessages", (state) => {
    state.message = null;
  });

  // ============== RESET STATE ==============
  builder.addCase("resetAdminProductState", (state) => {
    state.isCreated = false;
    state.isUpdated = false;
    state.isDeleted = false;
    state.isImageUpdated = false;
    state.isImageDeleted = false;
    state.error = null;
    state.message = null;
  });
});
