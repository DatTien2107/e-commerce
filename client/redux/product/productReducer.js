// redux/features/productReducer.js
import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  topProducts: [],
  singleProduct: null,
  totalProducts: 0,
  loading: false,
  error: null,
  message: null,
};

export const productReducer = createReducer(initialState, (builder) => {
  // GET ALL PRODUCTS
  builder.addCase("getAllProductsRequest", (state) => {
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getAllProductsSuccess", (state, action) => {
    state.loading = false;
    state.products = action.payload.products;
    state.totalProducts = action.payload.totalProducts;
    state.message = action.payload.message;
  });
  builder.addCase("getAllProductsFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.products = [];
  });

  // GET TOP PRODUCTS
  builder.addCase("getTopProductsRequest", (state) => {
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getTopProductsSuccess", (state, action) => {
    state.loading = false;
    state.topProducts = action.payload.products;
    state.message = action.payload.message;
  });
  builder.addCase("getTopProductsFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.topProducts = [];
  });

  // GET SINGLE PRODUCT
  builder.addCase("getSingleProductRequest", (state) => {
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getSingleProductSuccess", (state, action) => {
    state.loading = false;
    state.singleProduct = action.payload.product;
    state.message = action.payload.message;
  });
  builder.addCase("getSingleProductFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.singleProduct = null;
  });

  // CLEAR ERRORS AND MESSAGES
  builder.addCase("clearProductErrors", (state) => {
    state.error = null;
  });
  builder.addCase("clearProductMessages", (state) => {
    state.message = null;
  });
});
