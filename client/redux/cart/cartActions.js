// redux/cart/cartActions.js
import { server } from "../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper function để lấy token và tạo config
const getAuthConfig = async () => {
  try {
    // Sử dụng key "@auth" giống như trong login action
    const token = await AsyncStorage.getItem("@auth");

    if (!token) {
      console.log("❌ No token found in AsyncStorage");
      throw new Error("No authentication token found");
    }

    // Kiểm tra format JWT
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("❌ Invalid JWT format:", token.substring(0, 50));
      throw new Error("Invalid token format");
    }

    console.log("✅ Valid token found:", token.substring(0, 50) + "...");

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

// ADD TO CART
export const addToCart =
  (productId, quantity = 1) =>
  async (dispatch) => {
    try {
      dispatch({ type: "addToCartRequest" });

      console.log("🛒 Adding to cart:", { productId, quantity });

      const config = await getAuthConfig();
      const { data } = await axios.post(
        `${server}/cart/add`,
        { productId, quantity },
        config
      );

      console.log("✅ Product added to cart:", data);

      dispatch({
        type: "addToCartSuccess",
        payload: data,
      });

      // Cập nhật cart count sau khi thêm thành công
      dispatch(getCartCount());

      return { success: true, message: data.message };
    } catch (error) {
      console.log("❌ Add to cart error:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to add to cart";

      dispatch({
        type: "addToCartFail",
        payload: errorMessage,
      });

      return { success: false, message: errorMessage };
    }
  };

// GET CART
export const getCart = () => async (dispatch) => {
  try {
    dispatch({ type: "getCartRequest" });

    console.log("🛒 Fetching cart...");

    const config = await getAuthConfig();
    const { data } = await axios.get(`${server}/cart/`, config);

    console.log("✅ Cart fetched:", data);

    dispatch({
      type: "getCartSuccess",
      payload: data,
    });

    return data.cart;
  } catch (error) {
    console.log("❌ Get cart error:", error.response?.data || error.message);

    let errorMessage = "Failed to fetch cart";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Nếu là lỗi authentication, xóa token và redirect
    if (
      error.response?.status === 401 ||
      errorMessage.includes("token") ||
      errorMessage.includes("jwt")
    ) {
      console.log("🔐 Authentication error - clearing token");
      dispatch(handleAuthError());
      errorMessage = "Please login again";
    }

    dispatch({
      type: "getCartFail",
      payload: errorMessage,
    });

    return null;
  }
};

// UPDATE CART ITEM
export const updateCartItem = (productId, quantity) => async (dispatch) => {
  try {
    dispatch({ type: "updateCartItemRequest" });

    console.log("🔄 Updating cart item:", { productId, quantity });

    const config = await getAuthConfig();
    const { data } = await axios.put(
      `${server}/cart/update`,
      { productId, quantity },
      config
    );

    console.log("✅ Cart item updated:", data);

    dispatch({
      type: "updateCartItemSuccess",
      payload: data,
    });

    // Cập nhật cart count
    dispatch(getCartCount());

    return { success: true, message: data.message };
  } catch (error) {
    console.log("❌ Update cart error:", error.response?.data);

    const errorMessage =
      error.response?.data?.message || "Failed to update cart";

    dispatch({
      type: "updateCartItemFail",
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// REMOVE FROM CART
export const removeFromCart = (productId) => async (dispatch) => {
  try {
    dispatch({ type: "removeFromCartRequest" });

    console.log("🗑️ Removing from cart:", productId);

    const config = await getAuthConfig();
    const { data } = await axios.delete(
      `${server}/cart/remove/${productId}`,
      config
    );

    console.log("✅ Item removed from cart:", data);

    dispatch({
      type: "removeFromCartSuccess",
      payload: data,
    });

    // Cập nhật cart count
    dispatch(getCartCount());

    return { success: true, message: data.message };
  } catch (error) {
    console.log("❌ Remove from cart error:", error.response?.data);

    const errorMessage =
      error.response?.data?.message || "Failed to remove item";

    dispatch({
      type: "removeFromCartFail",
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// CLEAR CART
export const clearCart = () => async (dispatch) => {
  try {
    dispatch({ type: "clearCartRequest" });

    console.log("🧹 Clearing cart...");

    const config = await getAuthConfig();
    const { data } = await axios.delete(`${server}/cart/clear`, config);

    console.log("✅ Cart cleared:", data);

    dispatch({
      type: "clearCartSuccess",
      payload: data,
    });

    // Cập nhật cart count
    dispatch(getCartCount());

    return { success: true, message: data.message };
  } catch (error) {
    console.log("❌ Clear cart error:", error.response?.data);

    const errorMessage =
      error.response?.data?.message || "Failed to clear cart";

    dispatch({
      type: "clearCartFail",
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// GET CART COUNT
export const getCartCount = () => async (dispatch) => {
  try {
    dispatch({ type: "getCartCountRequest" });

    const config = await getAuthConfig();
    const { data } = await axios.get(`${server}/cart/count`, config);

    console.log("✅ Cart count fetched:", data.count);

    dispatch({
      type: "getCartCountSuccess",
      payload: data.count,
    });

    return data.count;
  } catch (error) {
    console.log("❌ Get cart count error:", error.response?.data);

    dispatch({
      type: "getCartCountFail",
      payload: 0,
    });

    return 0;
  }
};

// CLEAR CART ERRORS
export const clearCartErrors = () => (dispatch) => {
  dispatch({ type: "clearCartErrors" });
};

// CLEAR CART MESSAGES
export const clearCartMessages = () => (dispatch) => {
  dispatch({ type: "clearCartMessages" });
};

// HANDLE AUTHENTICATION ERROR - Xóa token và reset cart khi có lỗi auth
export const handleAuthError = () => async (dispatch) => {
  try {
    // Xóa token khỏi AsyncStorage
    await AsyncStorage.removeItem("@auth");

    // Reset cart state
    dispatch({ type: "resetCart" });

    console.log("🔐 Token removed due to authentication error");
  } catch (error) {
    console.log("❌ Error removing token:", error);
  }
};
