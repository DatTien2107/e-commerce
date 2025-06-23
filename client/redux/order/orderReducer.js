// redux/order/orderReducer.js
import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  currentOrder: null,
  paymentInfo: null,
  loading: false,
  error: null,
  message: null,

  // Specific loading states
  createOrderLoading: false,
  getMyOrdersLoading: false,
  getOrderDetailsLoading: false,
  processPaymentLoading: false,

  // ========== ADMIN ORDER STATES (NEW) ==========
  allOrders: [], // Tất cả orders cho admin
  getAllOrdersLoading: false,
  changeOrderStatusLoading: false,
  orderStatusChangeResult: null, // Kết quả thay đổi status
};

export const orderReducer = createReducer(initialState, (builder) => {
  // ========== USER ORDER CASES (Existing) ==========

  // CREATE ORDER
  builder.addCase("createOrderRequest", (state) => {
    state.createOrderLoading = true;
    state.loading = true;
    state.error = null;
    state.message = null;
  });
  builder.addCase("createOrderSuccess", (state, action) => {
    state.createOrderLoading = false;
    state.loading = false;
    state.currentOrder = action.payload.order;
    state.message = action.payload.message;
    state.error = null;
  });
  builder.addCase("createOrderFail", (state, action) => {
    state.createOrderLoading = false;
    state.loading = false;
    state.error = action.payload;
    state.message = null;
  });

  // GET MY ORDERS
  builder.addCase("getMyOrdersRequest", (state) => {
    state.getMyOrdersLoading = true;
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getMyOrdersSuccess", (state, action) => {
    state.getMyOrdersLoading = false;
    state.loading = false;
    state.orders = action.payload.orders;
    state.error = null;
  });
  builder.addCase("getMyOrdersFail", (state, action) => {
    state.getMyOrdersLoading = false;
    state.loading = false;
    state.error = action.payload;
  });

  // GET ORDER DETAILS
  builder.addCase("getOrderDetailsRequest", (state) => {
    state.getOrderDetailsLoading = true;
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getOrderDetailsSuccess", (state, action) => {
    state.getOrderDetailsLoading = false;
    state.loading = false;
    state.currentOrder = action.payload.order;
    state.error = null;
  });
  builder.addCase("getOrderDetailsFail", (state, action) => {
    state.getOrderDetailsLoading = false;
    state.loading = false;
    state.error = action.payload;
  });

  // PROCESS PAYMENT
  builder.addCase("processPaymentRequest", (state) => {
    state.processPaymentLoading = true;
    state.loading = true;
    state.error = null;
  });
  builder.addCase("processPaymentSuccess", (state, action) => {
    state.processPaymentLoading = false;
    state.loading = false;
    state.paymentInfo = action.payload;
    state.error = null;
  });
  builder.addCase("processPaymentFail", (state, action) => {
    state.processPaymentLoading = false;
    state.loading = false;
    state.error = action.payload;
  });

  // ========== ADMIN ORDER CASES (NEW) ==========

  // GET ALL ORDERS (ADMIN)
  builder.addCase("getAllOrdersRequest", (state) => {
    state.getAllOrdersLoading = true;
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getAllOrdersSuccess", (state, action) => {
    state.getAllOrdersLoading = false;
    state.loading = false;
    state.allOrders = action.payload.orders;
    state.error = null;
  });
  builder.addCase("getAllOrdersFail", (state, action) => {
    state.getAllOrdersLoading = false;
    state.loading = false;
    state.error = action.payload;
  });

  // CHANGE ORDER STATUS (ADMIN)
  builder.addCase("changeOrderStatusRequest", (state) => {
    state.changeOrderStatusLoading = true;
    state.loading = true;
    state.error = null;
    state.message = null;
    state.orderStatusChangeResult = null;
  });
  builder.addCase("changeOrderStatusSuccess", (state, action) => {
    state.changeOrderStatusLoading = false;
    state.loading = false;
    state.message = action.payload.message;
    state.orderStatusChangeResult = action.payload.data;
    state.error = null;

    // Cập nhật order trong allOrders array nếu có data
    if (action.payload.data && action.payload.data.orderId) {
      const orderIndex = state.allOrders.findIndex(
        (order) => order._id === action.payload.data.orderId
      );
      if (orderIndex !== -1) {
        state.allOrders[orderIndex].orderStatus = action.payload.data.newStatus;
        if (action.payload.data.deliveredAt) {
          state.allOrders[orderIndex].deliverdAt =
            action.payload.data.deliveredAt;
        }
        state.allOrders[orderIndex].updatedAt = action.payload.data.updatedAt;
      }
    }
  });
  builder.addCase("changeOrderStatusFail", (state, action) => {
    state.changeOrderStatusLoading = false;
    state.loading = false;
    state.error = action.payload;
    state.message = null;
    state.orderStatusChangeResult = null;
  });

  // ========== UTILITY CASES ==========

  // CLEAR ERRORS AND MESSAGES
  builder.addCase("clearOrderErrors", (state) => {
    state.error = null;
  });
  builder.addCase("clearOrderMessages", (state) => {
    state.message = null;
  });

  // CLEAR ORDER STATUS CHANGE RESULT (NEW)
  builder.addCase("clearOrderStatusChangeResult", (state) => {
    state.orderStatusChangeResult = null;
  });
});
