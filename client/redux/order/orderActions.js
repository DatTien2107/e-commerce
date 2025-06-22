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

// CLEAR ORDER ERRORS
export const clearOrderErrors = () => (dispatch) => {
  dispatch({ type: "clearOrderErrors" });
};

// CLEAR ORDER MESSAGES
export const clearOrderMessages = () => (dispatch) => {
  dispatch({ type: "clearOrderMessages" });
};
