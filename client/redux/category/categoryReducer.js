// redux/category/categoryReducer.js
import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  loading: false,
  error: null,
  message: null,
};

export const categoryReducer = createReducer(initialState, (builder) => {
  // GET ALL CATEGORIES
  builder.addCase("getAllCategoriesRequest", (state) => {
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getAllCategoriesSuccess", (state, action) => {
    state.loading = false;
    state.categories = action.payload.categories;
    state.message = action.payload.message;
  });
  builder.addCase("getAllCategoriesFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.categories = [];
  });

  // CLEAR ERRORS AND MESSAGES
  builder.addCase("clearCategoryErrors", (state) => {
    state.error = null;
  });
  builder.addCase("clearCategoryMessages", (state) => {
    state.message = null;
  });
});
