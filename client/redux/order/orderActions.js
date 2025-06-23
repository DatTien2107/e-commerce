// redux/order/orderActions.js
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

// ========== USER ORDER ACTIONS (Existing) ==========

// CREATE ORDER
export const createOrder = (orderData) => async (dispatch) => {
  try {
    dispatch({ type: "createOrderRequest" });

    console.log("📦 Creating order:", orderData);

    const config = await getAuthConfig();
    const { data } = await axios.post(
      `${server}/order/create`,
      orderData,
      config
    );

    console.log("✅ Order created successfully:", data);

    dispatch({
      type: "createOrderSuccess",
      payload: data,
    });

    return { success: true, message: data.message };
  } catch (error) {
    console.log("❌ Create order error:", error.response?.data);

    const errorMessage =
      error.response?.data?.message || "Failed to create order";

    dispatch({
      type: "createOrderFail",
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// GET MY ORDERS
export const getMyOrders = () => async (dispatch) => {
  try {
    dispatch({ type: "getMyOrdersRequest" });

    console.log("📋 Fetching my orders...");

    const config = await getAuthConfig();
    const { data } = await axios.get(`${server}/order/my-orders`, config);

    console.log("✅ My orders fetched:", data);

    dispatch({
      type: "getMyOrdersSuccess",
      payload: data,
    });

    return data.orders;
  } catch (error) {
    console.log("❌ Get my orders error:", error.response?.data);

    dispatch({
      type: "getMyOrdersFail",
      payload: error.response?.data?.message || "Failed to fetch orders",
    });

    return null;
  }
};

// GET SINGLE ORDER DETAILS
export const getOrderDetails = (orderId) => async (dispatch) => {
  try {
    dispatch({ type: "getOrderDetailsRequest" });

    console.log("🔍 Fetching order details:", orderId);

    const config = await getAuthConfig();
    const { data } = await axios.get(
      `${server}/order/my-orders/${orderId}`,
      config
    );

    console.log("✅ Order details fetched:", data);

    dispatch({
      type: "getOrderDetailsSuccess",
      payload: data,
    });

    return data.order;
  } catch (error) {
    console.log("❌ Get order details error:", error.response?.data);

    dispatch({
      type: "getOrderDetailsFail",
      payload: error.response?.data?.message || "Failed to fetch order details",
    });

    return null;
  }
};

// PROCESS PAYMENT
export const processPayment = (totalAmount) => async (dispatch) => {
  try {
    dispatch({ type: "processPaymentRequest" });

    console.log("💳 Processing payment for amount:", totalAmount);

    const config = await getAuthConfig();
    const { data } = await axios.post(
      `${server}/order/payments`,
      { totalAmount },
      config
    );

    console.log("✅ Payment processed:", data);

    dispatch({
      type: "processPaymentSuccess",
      payload: data,
    });

    return { success: true, clientSecret: data.client_secret };
  } catch (error) {
    console.log("❌ Process payment error:", error.response?.data);

    const errorMessage =
      error.response?.data?.message || "Failed to process payment";

    dispatch({
      type: "processPaymentFail",
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// ========== ADMIN ORDER ACTIONS ==========

// GET ALL ORDERS (ADMIN)
export const getAllOrders = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllOrdersRequest" });

    console.log("📋 Admin: Fetching all orders...");

    const config = await getAuthConfig();
    const { data } = await axios.get(
      `${server}/order/admin/get-all-orders`,
      config
    );

    console.log("✅ All orders fetched:", data);

    dispatch({
      type: "getAllOrdersSuccess",
      payload: data,
    });

    return { success: true, orders: data.orders };
  } catch (error) {
    console.log("❌ Get all orders error:", error.response?.data);

    const errorMessage =
      error.response?.data?.message || "Failed to fetch orders";

    dispatch({
      type: "getAllOrdersFail",
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// ========== CHANGE ORDER STATUS - IMPROVED ==========

// CHANGE ORDER STATUS (ADMIN) - Version cải thiện với tham số status
export const changeOrderStatus =
  (orderId, newStatus = null) =>
  async (dispatch) => {
    try {
      dispatch({ type: "changeOrderStatusRequest" });

      console.log(
        "🔄 Admin: Changing order status for:",
        orderId,
        "to:",
        newStatus
      );

      const config = await getAuthConfig();

      // Nếu có newStatus thì gửi trong body, không thì để empty để auto-advance
      const requestBody = newStatus ? { orderStatus: newStatus } : {};

      const { data } = await axios.put(
        `${server}/order/admin/order/${orderId}`,
        requestBody,
        config
      );

      console.log("✅ Order status changed:", data);

      dispatch({
        type: "changeOrderStatusSuccess",
        payload: data,
      });

      // Refresh all orders to get updated data
      dispatch(getAllOrders());

      return {
        success: true,
        message: data.message,
        data: data.data || null,
      };
    } catch (error) {
      console.log("❌ Change order status error:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to change order status";

      dispatch({
        type: "changeOrderStatusFail",
        payload: errorMessage,
      });

      return { success: false, message: errorMessage };
    }
  };

// Giữ lại function cũ để backward compatibility (tự động advance)
export const autoAdvanceOrderStatus = (orderId) => async (dispatch) => {
  return dispatch(changeOrderStatus(orderId)); // Gọi không có newStatus
};

// ========== UTILITY ACTIONS ==========

// CLEAR ORDER ERRORS
export const clearOrderErrors = () => (dispatch) => {
  dispatch({ type: "clearOrderErrors" });
};

// CLEAR ORDER MESSAGES
export const clearOrderMessages = () => (dispatch) => {
  dispatch({ type: "clearOrderMessages" });
};
