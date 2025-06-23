// redux/cart/cartActions.js
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

// Thêm cache để tránh fetch liên tục
let cartCache = {
  data: null,
  timestamp: 0,
  isLoading: false,
};

const CACHE_DURATION = 10000; // 30 seconds

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

      if (data.cart) {
        dispatch({
          type: "getCartSuccess",
          payload: data,
        });
      }

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

// GET CART - Thêm cache và debounce
export const getCart =
  (forceRefresh = false) =>
  async (dispatch, getState) => {
    try {
      // Kiểm tra cache nếu không force refresh
      const now = Date.now();
      if (
        !forceRefresh &&
        cartCache.data &&
        now - cartCache.timestamp < CACHE_DURATION
      ) {
        console.log("✅ Using cached cart data");
        dispatch({
          type: "getCartSuccess",
          payload: cartCache.data,
        });
        return cartCache.data.cart;
      }

      // Tránh multiple requests cùng lúc
      if (cartCache.isLoading && !forceRefresh) {
        console.log("⏳ Cart request already in progress");
        return null;
      }

      cartCache.isLoading = true;
      dispatch({ type: "getCartRequest" });

      console.log("🛒 Fetching cart...");

      const config = await getAuthConfig();
      const { data } = await axios.get(`${server}/cart/`, config);

      console.log("✅ Cart fetched:", data);

      // Update cache
      cartCache = {
        data: data,
        timestamp: now,
        isLoading: false,
      };

      dispatch({
        type: "getCartSuccess",
        payload: data,
      });

      return data.cart;
    } catch (error) {
      cartCache.isLoading = false;
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

    // Clear cache và refresh
    cartCache = { data: null, timestamp: 0, isLoading: false };

    setTimeout(() => {
      dispatch(getCart(true));
    }, 100);

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

    // Clear cache và refresh
    cartCache = { data: null, timestamp: 0, isLoading: false };

    setTimeout(() => {
      dispatch(getCart(true));
    }, 100);

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

    // Clear cache
    cartCache = { data: null, timestamp: 0, isLoading: false };

    dispatch({
      type: "clearCartSuccess",
      payload: data,
    });

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

// GET CART COUNT - Sử dụng cache từ getCart
export const getCartCount = () => async (dispatch, getState) => {
  try {
    dispatch({ type: "getCartCountRequest" });

    // Thử lấy từ current state trước
    const currentState = getState();
    if (
      currentState.cart &&
      currentState.cart.cart &&
      currentState.cart.cart.totalItems !== undefined
    ) {
      const count = currentState.cart.cart.totalItems;
      console.log("✅ Cart count from state:", count);

      dispatch({
        type: "getCartCountSuccess",
        payload: count,
      });

      return count;
    }

    // Nếu không có trong state, fetch từ API
    const config = await getAuthConfig();
    const { data } = await axios.get(`${server}/cart/count`, config);

    console.log("✅ Cart count fetched from API:", data.count);

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

// HANDLE AUTHENTICATION ERROR
export const handleAuthError = () => async (dispatch) => {
  try {
    await AsyncStorage.removeItem("@auth");

    // Clear cache
    cartCache = { data: null, timestamp: 0, isLoading: false };

    dispatch({ type: "resetCart" });

    console.log("🔐 Token removed due to authentication error");
  } catch (error) {
    console.log("❌ Error removing token:", error);
  }
};

// RESET CART CACHE - Helper function
export const resetCartCache = () => (dispatch) => {
  cartCache = { data: null, timestamp: 0, isLoading: false };
  console.log("🔄 Cart cache reset");
};
