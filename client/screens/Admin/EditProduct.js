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
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import Layout from "../../components/Layout/Layout";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

// Import actions
import {
  updateProduct,
  updateProductImage,
  deleteProductImage,
  clearAdminProductErrors,
  clearAdminProductMessages,
  resetAdminProductState,
  getAllProductsAdmin,
} from "../../redux/admin/adminProductActions";
import { getAllCategories } from "../../redux/category/categoryActions";
import { getSingleProduct } from "../../redux/product/productActions";

const EditProduct = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { productId, productName } = route.params;

  // Get state from Redux
  const {
    updateLoading,
    imageLoading,
    isUpdated,
    isImageUpdated,
    isImageDeleted,
    error,
    message,
  } = useSelector((state) => state.adminProduct);

  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );
  const { singleProduct, loading: productLoading } = useSelector(
    (state) => state.product
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load product details and categories
  useEffect(() => {
    console.log("📝 Loading product for edit:", productId);
    dispatch(getSingleProduct(productId));
    dispatch(getAllCategories());
    dispatch(resetAdminProductState());
  }, [dispatch, productId]);

  // Populate form when product data is loaded
  useEffect(() => {
    if (singleProduct && singleProduct._id === productId) {
      console.log("📋 Populating form with product data:", singleProduct);
      setFormData({
        name: singleProduct.name || "",
        description: singleProduct.description || "",
        price: singleProduct.price?.toString() || "",
        stock: singleProduct.stock?.toString() || "",
        category: singleProduct.category?._id || "",
      });
      setIsLoading(false);
    }
  }, [singleProduct, productId]);

  // Handle success/error messages
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearAdminProductErrors());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (message) {
      Alert.alert("Success", message);
      dispatch(clearAdminProductMessages());
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (isUpdated) {
      Alert.alert("Success", "Product updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            dispatch(resetAdminProductState());
            dispatch(getAllProductsAdmin());
            navigation.goBack();
          },
        },
      ]);
    }
  }, [isUpdated, dispatch, navigation]);

  // Reload product when images are updated/deleted
  useEffect(() => {
    if (isImageUpdated || isImageDeleted) {
      console.log("🔄 Reloading product after image change...");
      dispatch(getSingleProduct(productId));
      dispatch(resetAdminProductState());
    }
  }, [isImageUpdated, isImageDeleted, dispatch, productId]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Product description is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = "Valid price is required";
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      errors.stock = "Valid stock quantity is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle update
  const handleUpdate = () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors and try again");
      return;
    }

    const updateData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
    };

    console.log("📝 Updating product:", productId, updateData);
    dispatch(updateProduct(productId, updateData));
  };

  // Handle add image
  const handleAddImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];

        const formDataToSend = new FormData();
        formDataToSend.append("file", {
          uri: selectedImage.uri,
          type: selectedImage.mimeType || selectedImage.type || "image/jpeg",
          name:
            selectedImage.fileName ||
            selectedImage.name ||
            `image-${Date.now()}.jpg`,
        });

        console.log("🖼️ Adding new image to product:", productId);
        dispatch(updateProductImage(productId, formDataToSend));
      }
    } catch (error) {
      console.log("Error adding image:", error);
      Alert.alert("Error", "Failed to add image");
    }
  };

  // Handle delete image
  const handleDeleteImage = (imageId) => {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          console.log("🗑️ Deleting image:", imageId);
          dispatch(deleteProductImage(productId, imageId));
        },
      },
    ]);
  };

  // Image item component
  const ImageItem = ({ item, index }) => (
    <View style={styles.imageItem}>
      <Image source={{ uri: item.url }} style={styles.productImage} />
      <TouchableOpacity
        style={styles.deleteImageButton}
        onPress={() => handleDeleteImage(item._id)}
      >
        <AntDesign name="close" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading || productLoading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Product</Text>
          <View style={{ width: 24 }} />
        </View> */}

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
                placeholder="Enter product description"
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
            </View>

            {/* Price and Stock */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Price ($) *</Text>
                <TextInput
                  style={[styles.input, formErrors.price && styles.inputError]}
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(value) => handleInputChange("price", value)}
                  keyboardType="decimal-pad"
                />
                {formErrors.price && (
                  <Text style={styles.errorText}>{formErrors.price}</Text>
                )}
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Stock *</Text>
                <TextInput
                  style={[styles.input, formErrors.stock && styles.inputError]}
                  placeholder="0"
                  value={formData.stock}
                  onChangeText={(value) => handleInputChange("stock", value)}
                  keyboardType="number-pad"
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

            {/* Product Images */}
            <View style={styles.inputContainer}>
              <View style={styles.imagesHeader}>
                <Text style={styles.label}>Product Images</Text>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleAddImage}
                  disabled={imageLoading}
                >
                  {imageLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <AntDesign name="plus" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              {singleProduct?.images && singleProduct.images.length > 0 ? (
                <FlatList
                  data={singleProduct.images}
                  renderItem={({ item, index }) => (
                    <ImageItem item={item} index={index} />
                  )}
                  keyExtractor={(item, index) => `${item._id || index}`}
                  numColumns={3}
                  scrollEnabled={false}
                  contentContainerStyle={styles.imagesGrid}
                />
              ) : (
                <Text style={styles.noImagesText}>No images uploaded</Text>
              )}
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={[
                styles.updateButton,
                updateLoading && styles.updateButtonDisabled,
              ]}
              onPress={handleUpdate}
              disabled={updateLoading}
            >
              {updateLoading ? (
                <View style={styles.buttonLoading}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.updateButtonText}>Updating...</Text>
                </View>
              ) : (
                <Text style={styles.updateButtonText}>Update Product</Text>
              )}
            </TouchableOpacity>

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  // Header
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

  // Form
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

  // Row layout
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },

  // Picker
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

  // Images
  imagesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addImageButton: {
    backgroundColor: "#28a745",
    padding: 8,
    borderRadius: 20,
  },
  imagesGrid: {
    gap: 8,
  },
  imageItem: {
    flex: 1,
    margin: 4,
    position: "relative",
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  deleteImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#dc3545",
    borderRadius: 12,
    padding: 4,
  },
  noImagesText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    padding: 20,
  },

  // Button
  updateButton: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  updateButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonLoading: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerSpacing: {
    height: 20,
  },
});

export default EditProduct;
