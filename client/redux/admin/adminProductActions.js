// redux/features/adminProductActions.js
import { server } from "../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper function để lấy token và tạo config
const getAuthConfig = async () => {
  try {
    const token = await AsyncStorage.getItem("@auth");

    if (!token) {
      console.log("❌ No token found in AsyncStorage");
      throw new Error("No authentication token found");
    }

    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  } catch (error) {
    console.log("❌ Error getting auth token:", error);
    throw error;
  }
};

// Helper function for multipart requests
const getMultipartAuthConfig = async () => {
  try {
    const token = await AsyncStorage.getItem("@auth");

    if (!token) {
      console.log("❌ No token found in AsyncStorage");
      throw new Error("No authentication token found");
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        // Không set Content-Type cho multipart, để axios tự set với boundary
      },
    };
  } catch (error) {
    console.log("❌ Error getting auth token:", error);
    throw error;
  }
};

// CREATE PRODUCT
// Trong adminProductActions.js - thử fetch version
export const createProduct = (productData) => async (dispatch) => {
  try {
    dispatch({ type: "createProductRequest" });

    const token = await AsyncStorage.getItem("@auth");

    console.log("🌐 Making request with fetch...");

    const response = await fetch(`${server}/product/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Không set Content-Type cho FormData
      },
      body: productData,
    });

    console.log("📦 Fetch response status:", response.status);

    const data = await response.json();
    console.log("✅ Fetch response data:", data);

    dispatch({
      type: "createProductSuccess",
      payload: data,
    });
  } catch (error) {
    console.log("❌ Fetch error:", error.message);
    dispatch({
      type: "createProductFail",
      payload: error.message,
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = (productId, productData) => async (dispatch) => {
  try {
    dispatch({ type: "updateProductRequest" });

    console.log("📝 Updating product:", productId, productData);

    const config = await getAuthConfig();

    const { data } = await axios.put(
      `${server}/product/${productId}`,
      productData,
      config
    );

    console.log("✅ Product updated successfully:", data);

    dispatch({
      type: "updateProductSuccess",
      payload: data,
    });
  } catch (error) {
    console.log("❌ Update product error:", error.response?.data);

    dispatch({
      type: "updateProductFail",
      payload: error.response?.data?.message || "Failed to update product",
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = (productId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteProductRequest" });

    console.log("🗑️ Deleting product:", productId);

    const config = await getAuthConfig();

    const { data } = await axios.delete(
      `${server}/product/delete/${productId}`,
      config
    );

    console.log("✅ Product deleted successfully:", data);

    dispatch({
      type: "deleteProductSuccess",
      payload: { message: data.message, productId },
    });
  } catch (error) {
    console.log("❌ Delete product error:", error.response?.data);

    dispatch({
      type: "deleteProductFail",
      payload: error.response?.data?.message || "Failed to delete product",
    });
  }
};

// UPDATE PRODUCT IMAGE
export const updateProductImage =
  (productId, imageData) => async (dispatch) => {
    try {
      dispatch({ type: "updateProductImageRequest" });

      console.log("🖼️ Updating product image:", productId);

      const config = await getMultipartAuthConfig();

      const { data } = await axios.put(
        `${server}/product/image/${productId}`,
        imageData,
        config
      );

      console.log("✅ Product image updated successfully:", data);

      dispatch({
        type: "updateProductImageSuccess",
        payload: data,
      });
    } catch (error) {
      console.log("❌ Update product image error:", error.response?.data);

      dispatch({
        type: "updateProductImageFail",
        payload:
          error.response?.data?.message || "Failed to update product image",
      });
    }
  };

// DELETE PRODUCT IMAGE
export const deleteProductImage = (productId, imageId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteProductImageRequest" });

    console.log("🗑️ Deleting product image:", productId, imageId);

    const config = await getAuthConfig();

    const { data } = await axios.delete(
      `${server}/product/delete-image/${productId}?id=${imageId}`,
      config
    );

    console.log("✅ Product image deleted successfully:", data);

    dispatch({
      type: "deleteProductImageSuccess",
      payload: data,
    });
  } catch (error) {
    console.log("❌ Delete product image error:", error.response?.data);

    dispatch({
      type: "deleteProductImageFail",
      payload:
        error.response?.data?.message || "Failed to delete product image",
    });
  }
};

// GET ALL PRODUCTS FOR ADMIN (có thể khác với user)
export const getAllProductsAdmin =
  (keyword = "", category = "") =>
  async (dispatch) => {
    try {
      dispatch({ type: "getAllProductsAdminRequest" });

      console.log("👨‍💼 Admin fetching all products...");

      const config = await getAuthConfig();

      const { data } = await axios.get(`${server}/product/get-all`, {
        params: { keyword, category },
        ...config,
      });

      console.log("✅ Admin products fetched:", data);

      dispatch({
        type: "getAllProductsAdminSuccess",
        payload: data,
      });
    } catch (error) {
      console.log("❌ Get admin products error:", error.response?.data);

      dispatch({
        type: "getAllProductsAdminFail",
        payload: error.response?.data?.message || "Failed to fetch products",
      });
    }
  };

// CLEAR ADMIN PRODUCT ERRORS
export const clearAdminProductErrors = () => (dispatch) => {
  dispatch({ type: "clearAdminProductErrors" });
};

// CLEAR ADMIN PRODUCT MESSAGES
export const clearAdminProductMessages = () => (dispatch) => {
  dispatch({ type: "clearAdminProductMessages" });
};

// RESET ADMIN PRODUCT STATE
export const resetAdminProductState = () => (dispatch) => {
  dispatch({ type: "resetAdminProductState" });
};
