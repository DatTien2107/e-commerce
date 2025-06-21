// redux/features/productActions.js
import { server } from "../store";
import axios from "axios";

// GET ALL PRODUCTS
export const getAllProducts =
  (keyword = "", category = "") =>
  async (dispatch) => {
    try {
      dispatch({ type: "getAllProductsRequest" });

      console.log("🛍️ Fetching all products...");

      const { data } = await axios.get(`${server}/product/get-all`, {
        params: {
          keyword,
          category,
        },
      });

      console.log("✅ All products fetched:", data);

      dispatch({
        type: "getAllProductsSuccess",
        payload: data,
      });
    } catch (error) {
      console.log("❌ Get all products error:", error.response?.data);

      dispatch({
        type: "getAllProductsFail",
        payload: error.response?.data?.message || "Failed to fetch products",
      });
    }
  };

// GET TOP PRODUCTS
export const getTopProducts = () => async (dispatch) => {
  try {
    dispatch({ type: "getTopProductsRequest" });

    console.log("🏆 Fetching top products...");

    const { data } = await axios.get(`${server}/product/top`);

    console.log("✅ Top products fetched:", data);

    dispatch({
      type: "getTopProductsSuccess",
      payload: data,
    });
  } catch (error) {
    console.log("❌ Get top products error:", error.response?.data);

    dispatch({
      type: "getTopProductsFail",
      payload: error.response?.data?.message || "Failed to fetch top products",
    });
  }
};

// GET SINGLE PRODUCT
export const getSingleProduct = (productId) => async (dispatch) => {
  try {
    dispatch({ type: "getSingleProductRequest" });

    console.log("🔍 Fetching single product:", productId);

    const { data } = await axios.get(`${server}/product/${productId}`);

    console.log("✅ Single product fetched:", data);

    dispatch({
      type: "getSingleProductSuccess",
      payload: data,
    });
  } catch (error) {
    console.log("❌ Get single product error:", error.response?.data);

    dispatch({
      type: "getSingleProductFail",
      payload: error.response?.data?.message || "Failed to fetch product",
    });
  }
};

// CLEAR ERRORS
export const clearProductErrors = () => (dispatch) => {
  dispatch({ type: "clearProductErrors" });
};

// CLEAR MESSAGES
export const clearProductMessages = () => (dispatch) => {
  dispatch({ type: "clearProductMessages" });
};
