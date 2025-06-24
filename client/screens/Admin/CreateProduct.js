import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import Layout from "../../components/Layout/Layout";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Import actions
import {
  createProduct,
  clearAdminProductErrors,
  clearAdminProductMessages,
  resetAdminProductState,
} from "../../redux/admin/adminProductActions";
import { getAllCategories } from "../../redux/category/categoryActions";

const CreateProduct = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get state from Redux
  const { createLoading, isCreated, error, message } = useSelector(
    (state) => state.adminProduct
  );
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load categories when component mounts
  useEffect(() => {
    console.log("📂 Loading categories for CreateProduct...");
    dispatch(getAllCategories());

    // Reset admin product state when entering create page
    dispatch(resetAdminProductState());
  }, [dispatch]);

  // Handle success/error messages
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearAdminProductErrors());
    }

    if (isCreated && message) {
      Alert.alert("Success", message, [
        {
          text: "OK",
          onPress: () => {
            dispatch(clearAdminProductMessages());
            dispatch(resetAdminProductState());
            navigation.goBack(); // Return to ManageProducts
          },
        },
      ]);
    }
  }, [error, isCreated, message, dispatch, navigation]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        console.log("🖼️ Image selected:", result.assets[0].uri);

        // Clear image error if exists
        if (formErrors.image) {
          setFormErrors((prev) => ({
            ...prev,
            image: null,
          }));
        }
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      // Request camera permission
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera is required!"
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        console.log("📷 Photo taken:", result.assets[0].uri);

        // Clear image error if exists
        if (formErrors.image) {
          setFormErrors((prev) => ({
            ...prev,
            image: null,
          }));
        }
      }
    } catch (error) {
      console.log("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    Alert.alert("Select Image", "Choose how you want to add a product image", [
      { text: "Camera", onPress: takePhoto },
      { text: "Gallery", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Product name must be at least 3 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Product description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    // Price validation
    if (!formData.price) {
      errors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        errors.price = "Price must be a valid positive number";
      } else if (price > 999999) {
        errors.price = "Price cannot exceed $999,999";
      }
    }

    // Stock validation
    if (!formData.stock) {
      errors.stock = "Stock quantity is required";
    } else {
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        errors.stock = "Stock must be a valid non-negative number";
      } else if (stock > 999999) {
        errors.stock = "Stock cannot exceed 999,999";
      }
    }

    // Category validation
    if (!formData.category) {
      errors.category = "Category is required";
    }

    // Image validation
    if (!selectedImage) {
      errors.image = "Product image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors and try again");
      return;
    }

    try {
      console.log("📝 Submitting create product form...");

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", parseFloat(formData.price));
      formDataToSend.append("stock", parseInt(formData.stock));
      formDataToSend.append("category", formData.category);

      // Add image
      formDataToSend.append("file", {
        uri: selectedImage.uri,
        type: selectedImage.mimeType || selectedImage.type || "image/jpeg",
        name: selectedImage.fileName || `product-${Date.now()}.jpg`,
      });

      console.log("🚀 Dispatching createProduct action...");
      dispatch(createProduct(formDataToSend));
    } catch (error) {
      console.log("Error creating product:", error);
      Alert.alert("Error", "Failed to create product");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    });
    setSelectedImage(null);
    setFormErrors({});
  };

  return (
    <Layout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Product</Text>
          <TouchableOpacity onPress={resetForm}>
            <AntDesign name="reload1" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Product Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                placeholder="Enter product name"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                maxLength={100}
              />
              {formErrors.name && (
                <Text style={styles.errorText}>{formErrors.name}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  formErrors.description && styles.inputError,
                ]}
                placeholder="Enter detailed product description"
                value={formData.description}
                onChangeText={(value) =>
                  handleInputChange("description", value)
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={1000}
              />
              {formErrors.description && (
                <Text style={styles.errorText}>{formErrors.description}</Text>
              )}
              <Text style={styles.characterCount}>
                {formData.description.length}/1000 characters
              </Text>
            </View>

            {/* Price and Stock Row */}
            <View style={styles.row}>
              {/* Price */}
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Price ($) *</Text>
                <TextInput
                  style={[styles.input, formErrors.price && styles.inputError]}
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(value) => handleInputChange("price", value)}
                  keyboardType="decimal-pad"
                  maxLength={10}
                />
                {formErrors.price && (
                  <Text style={styles.errorText}>{formErrors.price}</Text>
                )}
              </View>

              {/* Stock */}
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Stock Qty *</Text>
                <TextInput
                  style={[styles.input, formErrors.stock && styles.inputError]}
                  placeholder="0"
                  value={formData.stock}
                  onChangeText={(value) => handleInputChange("stock", value)}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {formErrors.stock && (
                  <Text style={styles.errorText}>{formErrors.stock}</Text>
                )}
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category *</Text>
              <View
                style={[
                  styles.pickerContainer,
                  formErrors.category && styles.inputError,
                ]}
              >
                {categoriesLoading ? (
                  <View style={styles.pickerLoading}>
                    <ActivityIndicator size="small" color="#007bff" />
                    <Text style={styles.pickerLoadingText}>
                      Loading categories...
                    </Text>
                  </View>
                ) : (
                  <Picker
                    selectedValue={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a category" value="" />
                    {categories.map((category) => (
                      <Picker.Item
                        key={category._id}
                        label={category.category}
                        value={category._id}
                      />
                    ))}
                  </Picker>
                )}
              </View>
              {formErrors.category && (
                <Text style={styles.errorText}>{formErrors.category}</Text>
              )}
            </View>

            {/* Image Upload */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Product Image *</Text>
              <TouchableOpacity
                style={[
                  styles.imageUpload,
                  formErrors.image && styles.inputError,
                ]}
                onPress={showImagePickerOptions}
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.selectedImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <AntDesign name="camerao" size={40} color="#666" />
                    <Text style={styles.imageUploadText}>Tap to add image</Text>
                    <Text style={styles.imageUploadSubtext}>
                      Camera or Gallery
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {formErrors.image && (
                <Text style={styles.errorText}>{formErrors.image}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                createLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={createLoading}
            >
              {createLoading ? (
                <View style={styles.buttonLoading}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>Creating...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Create Product</Text>
              )}
            </TouchableOpacity>

            {/* Footer spacing */}
            <View style={styles.footerSpacing} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },

  // Form Styles
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    fontSize: 16,
    elevation: 1,
  },
  inputError: {
    borderColor: "#dc3545",
    borderWidth: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "right",
    marginTop: 4,
  },

  // Row layout
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },

  // Picker Styles
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    elevation: 1,
  },
  picker: {
    height: 50,
  },
  pickerLoading: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  pickerLoadingText: {
    marginLeft: 8,
    color: "#666",
  },

  // Image Upload Styles
  imageUpload: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imageUploadText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  imageUploadSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },

  // Button Styles
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonLoading: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Footer
  footerSpacing: {
    height: 20,
  },
});

export default CreateProduct;
