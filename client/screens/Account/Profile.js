// Fixed Profile.js - Prevent logout after image update

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import Layout from "../../components/Layout/Layout";
import { Image } from "react-native";
import InputBox from "../../components/Form/inputBox";
import {
  updateProfile,
  updatePassword,
  updateProfilePicture,
  getUserData,
  clearError,
  clearMessage,
} from "../../redux/features-auth/userActions";

const Profile = ({ navigation }) => {
  const dispatch = useDispatch();

  // Redux state
  const {
    user,
    loading,
    updateProfileLoading,
    updatePasswordLoading,
    updateProfilePicLoading,
    error,
    message,
  } = useSelector((state) => state.user);

  // Form states
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [country, setCountry] = useState("");

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Load user data when component mounts
  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  // ✅ Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setCountry(user.country || "");
      setContact(user.phone || "");
      setProfilePic(user.profilePic?.url || "");
    }
  }, [user]);

  // ✅ Handle success/error messages - NO NAVIGATION
  useEffect(() => {
    if (message) {
      Alert.alert("Success", message);
      dispatch(clearMessage());

      // Clear password form on success
      if (message.includes("Password")) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      }

      // ✅ FIX: NO AUTO NAVIGATION - Stay on profile page
      // Removed: navigation.navigate("account");
    }
  }, [message, dispatch]);

  // ✅ Handle errors - Check for auth errors
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearError());

      // ✅ Only navigate if it's an authentication error
      if (
        error.includes("authentication") ||
        error.includes("token") ||
        error.includes("login")
      ) {
        navigation.navigate("login");
      }
    }
  }, [error, dispatch, navigation]);

  // Validate profile form
  const validateProfileForm = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name is required");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Validation Error", "Valid email is required");
      return false;
    }
    if (!address.trim()) {
      Alert.alert("Validation Error", "Address is required");
      return false;
    }
    if (!city.trim()) {
      Alert.alert("Validation Error", "City is required");
      return false;
    }
    if (!country.trim()) {
      Alert.alert("Validation Error", "Country is required");
      return false;
    }
    if (!contact.trim()) {
      Alert.alert("Validation Error", "Phone number is required");
      return false;
    }
    return true;
  };

  // Handle profile update
  const handleUpdate = async () => {
    if (!validateProfileForm()) return;

    const profileData = {
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      phone: contact.trim(),
    };

    const result = await dispatch(updateProfile(profileData));

    if (result.success) {
      console.log("✅ Profile updated successfully");
      // Stay on current page - no navigation
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!oldPassword.trim()) {
      Alert.alert("Validation Error", "Current password is required");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert(
        "Validation Error",
        "New password must be at least 6 characters"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "New passwords do not match");
      return;
    }

    const passwordData = {
      oldPassword: oldPassword.trim(),
      newPassword: newPassword.trim(),
    };

    const result = await dispatch(updatePassword(passwordData));

    if (result.success) {
      console.log("✅ Password updated successfully");
      // Stay on current page - no navigation
    }
  };

  // ✅ FIXED: Better image picker with proper media library access
  const handleImagePicker = () => {
    Alert.alert("Update Profile Picture", "Choose an option", [
      { text: "📷 Camera", onPress: openCamera },
      { text: "🖼️ Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ✅ FIXED: Better camera implementation
  const openCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to take photos. Please enable it in Settings."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7, // Reduce quality for faster upload
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("📸 Captured image:", imageUri);

        // ✅ Optimistic update - show image immediately
        setProfilePic(imageUri);

        // Upload to server
        await handleImageUpload(imageUri);
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("Error", "Failed to access camera. Please try again.");
    }
  };

  // ✅ FIXED: Better gallery implementation - Force Photos tab
  const openGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Gallery permission is required to select photos. Please enable it in Settings."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7, // Reduce quality for faster upload
        allowsMultipleSelection: false,
        // ✅ Force to show all photos, not collections
        presentationStyle:
          ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("🖼️ Selected image:", imageUri);

        // ✅ Optimistic update - show image immediately
        setProfilePic(imageUri);

        // Upload to server
        await handleImageUpload(imageUri);
      }
    } catch (error) {
      console.log("Gallery error:", error);
      Alert.alert("Error", "Failed to access gallery. Please try again.");
    }
  };

  // ✅ Replace handleImageUpload function in Profile.js

  const handleImageUpload = async (imageUri) => {
    try {
      console.log("🚀 Starting image upload...");

      const result = await dispatch(updateProfilePicture(imageUri));

      console.log("📊 Upload result:", result);

      if (result && result.success) {
        console.log("✅ Image uploaded successfully");

        // ✅ Backend now returns updated user data, Redux automatically updates
        // The useEffect that watches `user` will automatically update profilePic state

        Alert.alert("Success", "Profile picture updated successfully!");
      } else {
        console.log("❌ Upload failed:", result?.message);
        // Revert optimistic update
        setProfilePic(user?.profilePic?.url || "");
        Alert.alert(
          "Upload Failed",
          result?.message || "Failed to update profile picture"
        );
      }
    } catch (error) {
      console.log("❌ Upload error:", error);
      // Revert optimistic update
      setProfilePic(user?.profilePic?.url || "");
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };

  // Show loading if user data is loading
  if (loading && !user) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ✅ Profile Picture Section */}
          <View style={styles.imageContainer}>
            {profilePic ? (
              <Image style={styles.image} source={{ uri: profilePic }} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>
                  {name ? name.charAt(0).toUpperCase() : "?"}
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleImagePicker}
              disabled={updateProfilePicLoading}
              style={styles.updatePicButton}
            >
              {updateProfilePicLoading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color="red" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              ) : (
                <Text style={styles.updatePicText}>Update profile pic</Text>
              )}
            </Pressable>
          </View>

          {/* Profile Form */}
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <InputBox
            value={name}
            setValue={setName}
            placeholder={"Enter your full name"}
            autoComplete={"name"}
          />
          <InputBox
            value={email}
            setValue={setEmail}
            placeholder={"Enter your email"}
            autoComplete={"email"}
            keyboardType="email-address"
          />
          <InputBox
            value={contact}
            setValue={setContact}
            placeholder={"Enter your phone number"}
            autoComplete={"tel"}
            keyboardType="phone-pad"
          />
          <InputBox
            value={address}
            setValue={setAddress}
            placeholder={"Enter your address"}
            autoComplete={"address-line1"}
          />
          <InputBox
            value={city}
            setValue={setCity}
            placeholder={"Enter your city"}
            autoComplete={"address-level2"}
          />
          <InputBox
            value={country}
            setValue={setCountry}
            placeholder={"Enter your country"}
            autoComplete={"country"}
          />

          {/* Update Profile Button */}
          <TouchableOpacity
            style={[
              styles.btnUpdate,
              updateProfileLoading && styles.btnDisabled,
            ]}
            onPress={handleUpdate}
            disabled={updateProfileLoading}
          >
            {updateProfileLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.btnUpdateText}>Update Profile</Text>
            )}
          </TouchableOpacity>

          {/* Password Section */}
          <View style={styles.passwordSection}>
            <TouchableOpacity
              style={styles.togglePasswordButton}
              onPress={() => setShowPasswordForm(!showPasswordForm)}
            >
              <Text style={styles.togglePasswordText}>
                {showPasswordForm ? "Hide Password Form" : "Change Password"}
              </Text>
            </TouchableOpacity>

            {showPasswordForm && (
              <>
                <Text style={styles.sectionTitle}>Change Password</Text>

                <InputBox
                  value={oldPassword}
                  setValue={setOldPassword}
                  placeholder={"Enter current password"}
                  secureTextEntry={true}
                />
                <InputBox
                  value={newPassword}
                  setValue={setNewPassword}
                  placeholder={"Enter new password (min 6 chars)"}
                  secureTextEntry={true}
                />
                <InputBox
                  value={confirmPassword}
                  setValue={setConfirmPassword}
                  placeholder={"Confirm new password"}
                  secureTextEntry={true}
                />

                <TouchableOpacity
                  style={[
                    styles.btnUpdate,
                    updatePasswordLoading && styles.btnDisabled,
                  ]}
                  onPress={handlePasswordUpdate}
                  disabled={updatePasswordLoading}
                >
                  {updatePasswordLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.btnUpdateText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    height: 120,
    width: 120,
    borderRadius: 60,
    resizeMode: "cover",
    borderWidth: 3,
    borderColor: "#000000",
  },
  imagePlaceholder: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000000",
  },
  imagePlaceholderText: {
    fontSize: 40,
    color: "#666",
    fontWeight: "bold",
  },
  updatePicButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  updatePicText: {
    color: "red",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  uploadingText: {
    color: "red",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 15,
  },
  btnUpdate: {
    backgroundColor: "#000000",
    height: 40,
    borderRadius: 20,
    marginHorizontal: 30,
    justifyContent: "center",
    marginTop: 10,
  },
  btnDisabled: {
    backgroundColor: "#666666",
  },
  btnUpdateText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  passwordSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  togglePasswordButton: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 30,
    marginBottom: 10,
  },
  togglePasswordText: {
    color: "#007bff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default Profile;
