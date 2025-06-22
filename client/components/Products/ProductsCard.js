// components/Products/ProductsBySections.js
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

const ProductsBySections = ({ navigation }) => {
  const dispatch = useDispatch();

  // Get products from Redux store
  const { products, loading, error } = useSelector((state) => state.product);

  // Fetch products when component mounts
  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  // Category mapping
  const getCategoryInfo = (categoryId) => {
    const categoryMap = {
      "685502367bc997a7cf9821a6": {
        name: "Phone",
        icon: "📱",
        color: "#007bff",
      },
      "6854fa0a7bc997a7cf98219c": {
        name: "Laptop",
        icon: "💻",
        color: "#28a745",
      },
      "6854fa147bc997a7cf98219f": {
        name: "PC",
        icon: "🖥️",
        color: "#dc3545",
      },
    };
    return (
      categoryMap[categoryId] || {
        name: "Unknown",
        icon: "📦",
        color: "#6c757d",
      }
    );
  };

  // Group products by category
  const groupProductsByCategory = () => {
    if (!products || products.length === 0) return {};

    const grouped = products.reduce((acc, product) => {
      const categoryId = product.category;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(product);
      return acc;
    }, {});

    return grouped;
  };

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

  const groupedProducts = groupProductsByCategory();
  const categoryIds = Object.keys(groupedProducts);

  // Show empty state
  if (categoryIds.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No products available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.mainContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Main Header */}
      <View style={styles.mainHeader}>
        <Text style={styles.mainTitle}>Our Products</Text>
        <Text style={styles.mainSubtitle}>
          {products.length} products in {categoryIds.length} categories
        </Text>
      </View>

      {/* Category Sections */}
      {categoryIds.map((categoryId) => {
        const categoryProducts = groupedProducts[categoryId];
        const categoryInfo = getCategoryInfo(categoryId);

        return (
          <CategorySection
            key={categoryId}
            categoryId={categoryId}
            categoryInfo={categoryInfo}
            products={categoryProducts}
            navigation={navigation}
          />
        );
      })}
    </ScrollView>
  );
};

// Category Section Component
const CategorySection = ({
  categoryId,
  categoryInfo,
  products,
  navigation,
}) => {
  const handleViewAll = () => {
    // Navigate to category page with all products
    navigation?.navigate("categoryProducts", {
      categoryId,
      categoryName: categoryInfo.name,
    });
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionIcon}>{categoryInfo.icon}</Text>
          <View>
            <Text style={[styles.sectionTitle, { color: categoryInfo.color }]}>
              {categoryInfo.name}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {products.length} item{products.length > 1 ? "s" : ""} available
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.viewAllButton, { borderColor: categoryInfo.color }]}
          onPress={handleViewAll}
        >
          <Text style={[styles.viewAllText, { color: categoryInfo.color }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Products Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsScrollContainer}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            navigation={navigation}
            categoryColor={categoryInfo.color}
            isFirst={index === 0}
            isLast={index === products.length - 1}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Product Card Component
const ProductCard = ({
  product,
  navigation,
  categoryColor,
  isFirst,
  isLast,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleProductPress = () => {
    navigation?.navigate("productDetails", { productId: product._id });
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) return;

    setIsAddingToCart(true);
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
            <Text style={styles.placeholderIcon}>📦</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

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
          <Text style={[styles.currentPrice, { color: categoryColor }]}>
            ${product.price.toLocaleString()}
          </Text>
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
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              { backgroundColor: categoryColor },
              (product.stock === 0 || isAddingToCart) &&
                styles.addToCartDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
          >
            <Text style={styles.addToCartText}>
              {isAddingToCart ? "⏳" : product.stock === 0 ? "❌" : "🛒"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Main Header
  mainHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  // Section Styles
  sectionContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  sectionIcon: {
    fontSize: 28,
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },

  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },

  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Products Scroll
  productsScrollContainer: {
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
    height: 120,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImage: {
    width: "70%",
    height: "80%",
    borderRadius: 8,
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
  currentPrice: {
    fontSize: 16,
    fontWeight: "800",
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

export default ProductsBySections;
