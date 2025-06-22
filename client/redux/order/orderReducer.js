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
};

export const orderReducer = createReducer(initialState, (builder) => {
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

  // CLEAR ERRORS AND MESSAGES
  builder.addCase("clearOrderErrors", (state) => {
    state.error = null;
  });
  builder.addCase("clearOrderMessages", (state) => {
    state.message = null;
  });
});
