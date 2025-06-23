import { createReducer } from "@reduxjs/toolkit";

// ✅ Enhanced initial state với profile loading states
const initialState = {
  token: null,
  user: null,
  isAuth: false,
  loading: false,

  // ✅ NEW: Separate loading states for profile actions
  updateProfileLoading: false,
  updatePasswordLoading: false,
  updateProfilePicLoading: false,

  error: null,
  message: null,
};

export const userReducer = createReducer(initialState, (builder) => {
  // LOGIN CASE
  builder.addCase("loginRequest", (state, action) => {
    state.loading = true;
    state.error = null;
  });
  builder.addCase("logingSucess", (state, action) => {
    state.loading = false;
    state.message = action.payload.message;
    state.isAuth = true;
    state.token = action.payload.token;
    state.user = action.payload.user;
  });
  builder.addCase("loginFail", (state, action) => {
    state.loading = false;
    state.isAuth = false;
    state.error = action.payload;
  });

  // ERROR MESSAGE CASE
  builder.addCase("clearError", (state) => {
    state.error = null;
  });
  builder.addCase("clearMessage", (state) => {
    state.message = null;
  });

  //REGISTER
  builder.addCase("registerRequest", (state, action) => {
    state.loading = true;
    state.error = null;
  });
  builder.addCase("registerSucess", (state, action) => {
    state.loading = false;
    state.message = action.payload;
  });
  builder.addCase("registerFail", (state, action) => {
    state.loading = false;
    state.isAuth = false;
    state.error = action.payload;
  });

  //  GET USER DATA
  builder.addCase("getUserDataRequest", (state, action) => {
    state.loading = true;
    state.error = null;
  });
  builder.addCase("getUserDataSuccess", (state, action) => {
    state.loading = false;
    state.isAuth = true;
    state.user = action.payload;
  });
  // ✅ CRITICAL FIX: Don't logout on getUserData fail
  builder.addCase("getUserDataFail", (state, action) => {
    state.loading = false;
    // ✅ REMOVED: state.isAuth = false;
    // Only set error, keep user logged in
    state.error = action.payload;

    // ✅ Only logout if it's a real auth error (401, token invalid, etc.)
    // For network errors, server issues, etc. - keep user logged in
    console.log(
      "getUserData failed but keeping user logged in:",
      action.payload
    );
  });

  // ✅ NEW: UPDATE PROFILE CASES
  builder.addCase("updateProfileRequest", (state) => {
    state.updateProfileLoading = true;
    state.error = null;
  });
  builder.addCase("updateProfileSuccess", (state, action) => {
    state.updateProfileLoading = false;
    state.message = action.payload.message;
  });
  builder.addCase("updateProfileFail", (state, action) => {
    state.updateProfileLoading = false;
    state.error = action.payload;
  });

  // ✅ NEW: UPDATE PASSWORD CASES
  builder.addCase("updatePasswordRequest", (state) => {
    state.updatePasswordLoading = true;
    state.error = null;
  });
  builder.addCase("updatePasswordSuccess", (state, action) => {
    state.updatePasswordLoading = false;
    state.message = action.payload.message;
  });
  builder.addCase("updatePasswordFail", (state, action) => {
    state.updatePasswordLoading = false;
    state.error = action.payload;
  });

  // ✅ NEW: UPDATE PROFILE PICTURE CASES
  builder.addCase("updateProfilePicRequest", (state) => {
    state.updateProfilePicLoading = true;
    state.error = null;
  });
  builder.addCase("updateProfilePicSuccess", (state, action) => {
    state.updateProfilePicLoading = false;
    state.message = action.payload.message;
  });
  builder.addCase("updateProfilePicFail", (state, action) => {
    state.updateProfilePicLoading = false;
    state.error = action.payload;
  });

  // ✅ NEW: Handle explicit auth errors (for real logout scenarios)
  builder.addCase("authenticationFail", (state, action) => {
    state.loading = false;
    state.isAuth = false; // Only logout on explicit auth failures
    state.user = null;
    state.token = null;
    state.error = action.payload;
  });

  // LOGOUT
  builder.addCase("logoutRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("logoutSucess", (state, action) => {
    state.loading = false;
    state.isAuth = false;
    state.user = null;
    state.token = null;
    state.message = action.payload;

    // ✅ Reset all profile loading states on logout
    state.updateProfileLoading = false;
    state.updatePasswordLoading = false;
    state.updateProfilePicLoading = false;
  });
  builder.addCase("logoutFail", (state, action) => {
    state.loading = false;
    state.isAuth = false;
    state.error = action.payload;
  });
});
