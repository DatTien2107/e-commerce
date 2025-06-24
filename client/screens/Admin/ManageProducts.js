import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Layout from "../../components/Layout/Layout";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

// Import actions
import {
  getAllProductsAdmin,
  deleteProduct,
  clearAdminProductErrors,
  clearAdminProductMessages,
  resetAdminProductState,
} from "../../redux/admin/adminProductActions";

const ManageProducts = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get state from Redux
  const {
    adminProducts,
    totalAdminProducts,
    loading,
    deleteLoading,
    error,
    message,
    isDeleted,
  } = useSelector((state) => state.adminProduct);

  // Local state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Load products when component mounts
  useEffect(() => {
    console.log("🛍️ ManageProducts mounted, loading admin products...");
    dispatch(getAllProductsAdmin());
  }, [dispatch]);

  // ✅ FIXED: Separate useEffect for error handling
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearAdminProductErrors());
    }
  }, [error, dispatch]);

  // ✅ FIXED: Separate useEffect for success message
  useEffect(() => {
    if (message) {
      Alert.alert("Success", message);
      dispatch(clearAdminProductMessages());
    }
  }, [message, dispatch]);

  // ✅ FIXED: Separate useEffect for delete success
  useEffect(() => {
    if (isDeleted) {
      console.log("✅ Product deleted, reloading list...");
      dispatch(getAllProductsAdmin(searchKeyword));
      // Reset isDeleted flag để tránh reload liên tục
      dispatch(resetAdminProductState());
    }
  }, [isDeleted, dispatch]); // Bỏ searchKeyword dependency

  // Handle search
  const handleSearch = () => {
    console.log("🔍 Searching products with keyword:", searchKeyword);
    dispatch(getAllProductsAdmin(searchKeyword));
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(getAllProductsAdmin(searchKeyword));
    setRefreshing(false);
  };

  // Handle delete product
  const handleDelete = (productId, productName) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("🗑️ Deleting product:", productId);
            dispatch(deleteProduct(productId));
          },
        },
      ]
    );
  };

  // Product item component
  const ProductItem = ({ item }) => (
    <View style={styles.productCard}>
      {/* Product Image */}
      <Image
        source={{
          uri:
            item.images && item.images[0]?.url
              ? item.images[0].url
              : "https://via.placeholder.com/100x100?text=No+Image",
        }}
        style={styles.productImage}
        resizeMode="cover"
      />

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.productPrice}>
          ${parseFloat(item.price).toFixed(2)}
        </Text>

        <View style={styles.productMeta}>
          <Text style={styles.productStock}>
            Stock: {item.stock}
            {item.stock <= 5 && (
              <Text style={styles.lowStock}> (Low Stock)</Text>
            )}
          </Text>

          <Text style={styles.productCategory} numberOfLines={1}>
            {item.category?.category || "No Category"}
          </Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <AntDesign name="star" size={12} color="#ffa502" />
          <Text style={styles.ratingText}>
            {item.rating ? item.rating.toFixed(1) : "0.0"} (
            {item.numReviews || 0})
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("editProduct", {
              productId: item._id,
              productName: item.name,
            })
          }
        >
          <AntDesign name="edit" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, deleteLoading && styles.buttonDisabled]}
          onPress={() => handleDelete(item._id, item.name)}
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <AntDesign name="delete" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <AntDesign name="inbox" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchKeyword
          ? `No products match "${searchKeyword}"`
          : "Start by creating your first product"}
      </Text>
      {!searchKeyword && (
        <TouchableOpacity
          style={styles.createFirstButton}
          onPress={() => navigation.navigate("createProduct")}
        >
          <Text style={styles.createFirstButtonText}>Create First Product</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Manage Products</Text>
            <Text style={styles.headerSubtitle}>
              {totalAdminProducts || adminProducts.length} products
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("createProduct")}
          >
            <AntDesign name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <AntDesign
              name="search1"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products by name..."
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchKeyword.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchKeyword("");
                  dispatch(getAllProductsAdmin(""));
                }}
                style={styles.clearSearchButton}
              >
                <AntDesign name="close" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.buttonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AntDesign name="search1" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Products List */}
        {loading && adminProducts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <FlatList
            data={adminProducts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <ProductItem item={item} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#007bff"]}
              />
            }
            ListEmptyComponent={<EmptyState />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              adminProducts.length === 0 ? styles.emptyListContainer : null
            }
          />
        )}
      </View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 25,
    elevation: 2,
  },

  // Search Styles
  searchContainer: {
    flexDirection: "row",
    margin: 12,
    marginTop: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  clearSearchButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
    marginLeft: 12,
    elevation: 2,
  },

  // Product Card Styles
  productCard: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 16,
    backgroundColor: "#f8f9fa",
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 4,
  },
  productMeta: {
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  lowStock: {
    color: "#dc3545",
    fontWeight: "bold",
  },
  productCategory: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#ffa502",
    marginLeft: 4,
    fontWeight: "600",
  },

  // Action Buttons
  actionButtons: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 12,
  },
  editButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 20,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
    opacity: 0.7,
  },

  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createFirstButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ManageProducts;
