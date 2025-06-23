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

// Helper function cho FormData requests (upload ảnh)
const getAuthConfigFormData = async () => {
  try {
    const token = await AsyncStorage.getItem("@auth");

    if (!token) {
      console.log("❌ No token found in AsyncStorage");
      throw new Error("No authentication token found");
    }

    return {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
  } catch (error) {
    console.log("❌ Error getting auth token:", error);
    throw error;
  }
};

// action login
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: "loginRequest",
    });
    // hitting node login api request
    const { data } = await axios.post(
      `${server}/user/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    dispatch({
      type: "logingSucess",
      payload: data,
    });
    await AsyncStorage.setItem("@auth", data?.token);
  } catch (error) {
    dispatch({
      type: "loginFail",
      payload: error.response.data.message,
    });
  }
};

// register action
export const register = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "registerRequest",
    });
    // hitapi register
    const { data } = await axios.post(`${server}/user/register`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch({
      type: "registerSucess",
      payload: data.message,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "registerFail",
      payload: error.response.data.message,
    });
  }
};

// GET USER DATTA ACTION
export const getUserData = () => async (dispatch) => {
  try {
    dispatch({
      type: "getUserDataRequest",
    });

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem("@auth");

    if (!token) {
      throw new Error("No authentication token found");
    }

    // GET request with Authorization header
    const { data } = await axios.get(`${server}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`, //
        "Content-Type": "application/json",
      },
    });

    dispatch({
      type: "getUserDataSuccess", //
      payload: data?.user,
    });
  } catch (error) {
    dispatch({
      type: "getUserDataFail",
      payload: error.response?.data?.message || "Failed to get user data",
    });
  }
};

// ✅ NEW: UPDATE PROFILE ACTION
export const updateProfile = (profileData) => async (dispatch) => {
  try {
    dispatch({ type: "updateProfileRequest" });

    console.log("✏️ Updating profile:", profileData);

    const config = await getAuthConfig();
    const { data } = await axios.put(
      `${server}/user/profile-update`,
      profileData,
      config
    );

    console.log("✅ Profile updated:", data);

    dispatch({
      type: "updateProfileSuccess",
      payload: data,
    });

    // Refresh user data sau khi update thành công
    // dispatch(getUserData());

    return { success: true, message: data.message };
  } catch (error) {
    console.log("❌ Update profile error:", error.response?.data);

    const errorMessage =
      error.response?.data?.message || "Failed to update profile";

    dispatch({
      type: "updateProfileFail",
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// ✅ NEW: UPDATE PASSWORD ACTION
export const updatePassword = (passwordData) => async (dispatch) => {
  try {
    dispatch({ type: "updatePasswordRequest" });

    console.log("🔐 Updating password...");

    const config = await getAuthConfig();
    const { data } = await axios.put(
      `${server}/user/update-password`,
      passwordData,
      config
    );

    console.log("✅ Password updated:", data);

    dispatch({
      type: "updatePasswordSuccess",
      payload: data,
    });

    return { success: true, message: data.message };
  } catch (error) {
    console.log("❌ Update password error:", error.response?.data);

    const errorMessage =
      error.response?.data?.message || "Failed to update password";

    dispatch({
      type: "updatePasswordFail",
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// ✅ Replace updateProfilePicture function in userActions.js

export const updateProfilePicture = (imageUri) => async (dispatch) => {
  try {
    dispatch({ type: "updateProfilePicRequest" });

    console.log("📸 Updating profile picture...");

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    });

    const config = await getAuthConfigFormData();
    const { data } = await axios.put(
      `${server}/user/update-picture`,
      formData,
      config
    );

    console.log("✅ Profile picture updated:", data);

    dispatch({
      type: "updateProfilePicSuccess",
      payload: data,
    });

    // ✅ NEW: If backend returns user data, update Redux store automatically
    if (data.user) {
      console.log("🔄 Updating user data in Redux store");
      dispatch({
        type: "getUserDataSuccess",
        payload: data.user,
      });
    }

    return {
      success: true,
      message: data.message,
      data: data, // ✅ Pass full response including user data
    };
  } catch (error) {
    console.log("❌ Update profile picture error:", error.response?.data);

    const errorMessage =
      error.response?.data?.message || "Failed to update profile picture";

    dispatch({
      type: "updateProfilePicFail",
      payload: errorMessage,
    });

    return { success: false, message: errorMessage };
  }
};

// LOGOUT ACTION
export const logout = () => async (dispatch) => {
  try {
    dispatch({
      type: "logoutRequest",
    });

    // Clear token from AsyncStorage trước
    await AsyncStorage.removeItem("@auth");

    // hitting node logout api request (optional)
    try {
      const { data } = await axios.get(`${server}/user/logout`);
      dispatch({
        type: "logoutSucess",
        payload: data?.message,
      });
    } catch (apiError) {
      // Nếu API lỗi nhưng token đã xóa thì vẫn coi là thành công
      dispatch({
        type: "logoutSucess",
        payload: "Logged out successfully",
      });
    }
  } catch (error) {
    dispatch({
      type: "logoutFail",
      payload: error.response?.data?.message || "Logout failed",
    });
  }
};

// ✅ NEW: CLEAR ERROR ACTION
export const clearError = () => (dispatch) => {
  dispatch({ type: "clearError" });
};

// ✅ NEW: CLEAR MESSAGE ACTION
export const clearMessage = () => (dispatch) => {
  dispatch({ type: "clearMessage" });
};
