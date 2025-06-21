// components/Products/Products.js - REDESIGNED VERSION
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../../redux/product/productActions";

const { width } = Dimensions.get("window");

const Products = ({ navigation }) => {
  const dispatch = useDispatch();

  // Get products from Redux store
  const { products, loading, error, totalProducts } = useSelector(
    (state) => state.product
  );

  // Fetch products when component mounts
  useEffect(() => {
    console.log("Products component mounted, fetching products...");
    dispatch(getAllProducts());
  }, [dispatch]);

  // Handle error
  useEffect(() => {
    if (error) {
      console.log("Products error:", error);
    }
  }, [error]);

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Show error state
  if (error && (!products || products.length === 0)) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load products</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(getAllProducts())}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show empty state
  if (!products || products.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No products available</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(getAllProducts())}
        >
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log("Rendering products:", products.length);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Featured Products</Text>
          <Text style={styles.headerSubtitle}>
            {totalProducts || products.length} items available
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => dispatch(getAllProducts())}
        >
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            navigation={navigation}
            isFirst={index === 0}
            isLast={index === products.length - 1}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ product, navigation, isFirst, isLast }) => {
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleProductPress = () => {
    navigation?.navigate("productDetails", { productId: product._id });
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) return;

    setIsAddingToCart(true);

    // Simulate add to cart API call
    setTimeout(() => {
      setIsAddingToCart(false);
      Alert.alert(
        "Added to Cart! 🛒",
        `${product.name} has been added to your cart.`,
        [{ text: "OK" }]
      );
    }, 500);
  };

  const getImageUri = () => {
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0]?.url;
    }
    return null;
  };

  const imageUri = getImageUri();
  const hasValidImage = imageUri && !imageError;

  // Calculate discount if exists
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <View
      style={[
        styles.card,
        isFirst && styles.cardFirst,
        isLast && styles.cardLast,
      ]}
    >
      {/* Image Container */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleProductPress}
        activeOpacity={0.8}
      >
        {hasValidImage ? (
          <Image
            style={styles.cardImage}
            source={{ uri: imageUri }}
            onError={() => setImageError(true)}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>📱</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.cardContent}>
        <TouchableOpacity onPress={handleProductPress}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {product.name}
          </Text>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {product.description}
          </Text>
        </TouchableOpacity>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>${product.price}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            )}
          </View>

          {product.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                ⭐ {product.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Stock Info */}
        <View style={styles.stockContainer}>
          <View
            style={[
              styles.stockIndicator,
              product.stock > 10
                ? styles.stockHigh
                : product.stock > 0
                ? styles.stockLow
                : styles.stockEmpty,
            ]}
          >
            <Text style={styles.stockText}>
              {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleProductPress}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              (product.stock === 0 || isAddingToCart) &&
                styles.addToCartDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
          >
            <Text style={styles.addToCartText}>
              {isAddingToCart ? "⏳" : product.stock === 0 ? "❌" : "🛒 Add"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  refreshText: {
    fontSize: 16,
  },

  // Scroll Container
  scrollContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },

  // Card Styles
  card: {
    width: width * 0.55,
    backgroundColor: "#ffffff",
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardFirst: {
    marginLeft: 0,
  },
  cardLast: {
    marginRight: 0,
  },

  // Image Styles
  imageContainer: {
    position: "relative",
    height: 160,
    backgroundColor: "#f8f9fa",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },

  // Badge Styles
  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#ff4757",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    backgroundColor: "#dc3545",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  // Content Styles
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
    lineHeight: 18,
  },
  cardDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 15,
    marginBottom: 8,
  },

  // Price Styles
  priceSection: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2ed573",
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 10,
    color: "#ffa502",
    fontWeight: "600",
  },

  // Stock Styles
  stockContainer: {
    marginBottom: 10,
  },
  stockIndicator: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockHigh: {
    backgroundColor: "#d4edda",
  },
  stockLow: {
    backgroundColor: "#fff3cd",
  },
  stockEmpty: {
    backgroundColor: "#f8d7da",
  },
  stockText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#495057",
  },

  // Button Styles
  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  detailsButtonText: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
    color: "#495057",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#007bff",
    paddingVertical: 8,
    borderRadius: 6,
  },
  addToCartDisabled: {
    backgroundColor: "#6c757d",
  },
  addToCartText: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    color: "white",
  },

  // Loading/Error States
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Products;
