// redux/category/categoryActions.js - FIXED API endpoint
import { server } from "../store";
import axios from "axios";

// GET ALL CATEGORIES
export const getAllCategories = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllCategoriesRequest" });

    const { data } = await axios.get(`${server}/cat/get-all`);

    dispatch({
      type: "getAllCategoriesSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "getAllCategoriesFail",
      payload: error.response?.data?.message || "Failed to fetch categories",
    });
  }
};

// CLEAR ERRORS
export const clearCategoryErrors = () => (dispatch) => {
  dispatch({ type: "clearCategoryErrors" });
};

// CLEAR MESSAGES
export const clearCategoryMessages = () => (dispatch) => {
  dispatch({ type: "clearCategoryMessages" });
};
