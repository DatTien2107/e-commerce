// components/Products/ProductsBySections.js - CẬP NHẬT VỚI CART
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
import { getAllCategories } from "../../redux/category/categoryActions";
import { addToCart, getCartCount } from "../../redux/cart/cartActions"; // Thêm import này

const { width } = Dimensions.get("window");

const ProductsBySections = ({ navigation }) => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Get data from Redux
  const { products, loading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const { cartCount } = useSelector((state) => state.cart); // Thêm cart state

  // Fetch data khi component mount
  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getAllCategories());
    dispatch(getCartCount()); // Load cart count khi app mở
  }, [dispatch]);

  // Fetch products khi category thay đổi
  useEffect(() => {
    if (selectedCategory === "all") {
      dispatch(getAllProducts());
    } else {
      dispatch(getAllProducts("", selectedCategory));
    }
  }, [selectedCategory, dispatch]);

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.loadingText}>Loading amazing products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header với Cart Badge */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Products</Text>
            <Text style={styles.subtitle}>
              {products?.length || 0} amazing products
            </Text>
          </View>

          {/* Cart Icon với Badge */}
          <TouchableOpacity
            style={styles.cartIcon}
            onPress={() => navigation?.navigate("cart")}
          >
            <Text style={styles.cartIconText}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? "99+" : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs với design đẹp */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {/* All Tab */}
          <TouchableOpacity
            style={[styles.tab, selectedCategory === "all" && styles.tabActive]}
            onPress={() => setSelectedCategory("all")}
          >
            <View
              style={[
                styles.tabIconContainer,
                selectedCategory === "all" && styles.tabIconActive,
              ]}
            >
              <Text style={styles.tabIcon}>🏪</Text>
            </View>
            <Text
              style={[
                styles.tabText,
                selectedCategory === "all" && styles.tabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {/* Category Tabs */}
          {categories?.map((category) => {
            const isSelected = selectedCategory === category._id;
            const categoryInfo = getCategoryInfo(category.category);

            return (
              <TouchableOpacity
                key={category._id}
                style={[styles.tab, isSelected && styles.tabActive]}
                onPress={() => setSelectedCategory(category._id)}
              >
                <View
                  style={[
                    styles.tabIconContainer,
                    isSelected && [
                      styles.tabIconActive,
                      { backgroundColor: categoryInfo.color },
                    ],
                  ]}
                >
                  <Text style={styles.tabIcon}>{categoryInfo.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.tabText,
                    isSelected && [
                      styles.tabTextActive,
                      { color: categoryInfo.color },
                    ],
                  ]}
                >
                  {categoryInfo.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ProductsGrid products={products} navigation={navigation} />
      </ScrollView>
    </View>
  );
};

// Helper function (giữ nguyên)
const getCategoryInfo = (categoryName) => {
  const categoryMap = {
    laptop: {
      name: "Laptop",
      icon: "💻",
      color: "#FF6B6B",
      gradient: ["#FF6B6B", "#FF8E8E"],
    },
    pc: {
      name: "PC",
      icon: "🖥️",
      color: "#4ECDC4",
      gradient: ["#4ECDC4", "#44A08D"],
    },
    phone: {
      name: "Phone",
      icon: "📱",
      color: "#45B7D1",
      gradient: ["#45B7D1", "#96C9DC"],
    },
    ipad: {
      name: "iPad",
      icon: "💻",
      color: "#9B59B6",
      gradient: ["#9B59B6", "#BE90D4"],
    },
    headphone: {
      name: "headphone",
      icon: "🎧",
      color: "#8B47B8",
      gradient: ["#9B59B6", "#BE90D4"],
    },
  };

  return (
    categoryMap[categoryName?.toLowerCase()] || {
      name: categoryName || "Unknown",
      icon: "📦",
      color: "#95A5A6",
      gradient: ["#95A5A6", "#BDC3C7"],
    }
  );
};

// Products Grid Component (giữ nguyên)
const ProductsGrid = ({ products, navigation }) => {
  if (!products || products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛍️</Text>
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.emptySubtitle}>
          Try selecting a different category
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {products.map((product, index) => (
        <ProductCard
          key={product._id}
          product={product}
          navigation={navigation}
          index={index}
        />
      ))}
    </View>
  );
};

// CẬP NHẬT Product Card Component với Cart Integration
const ProductCard = ({ product, navigation, index }) => {
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);

  // Get cart loading state từ Redux
  const { addToCartLoading } = useSelector((state) => state.cart);

  const handlePress = () => {
    navigation?.navigate("productDetails", { productId: product._id });
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      Alert.alert("Out of Stock", "This product is currently out of stock.");
      return;
    }

    try {
      // Dispatch action add to cart
      const result = await dispatch(addToCart(product._id, 1));

      if (result.success) {
        // Show success alert
        Alert.alert(
          "Added to Cart! 🛒",
          `${product.name} has been added to your cart.`,
          [
            {
              text: "Continue Shopping",
              style: "cancel",
            },
            {
              text: "View Cart",
              onPress: () => navigation?.navigate("cart"),
            },
          ]
        );
      } else {
        // Show error alert
        Alert.alert(
          "Error",
          result.message || "Failed to add product to cart",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Something went wrong. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const imageUri = product.images?.[0]?.url;
  const categoryInfo = getCategoryInfo(product.category?.category);

  // Animation delay based on index
  const animationDelay = (index % 2) * 100;

  return (
    <View
      style={[
        styles.card,
        {
          transform: [{ translateY: animationDelay * 0.01 }],
        },
      ]}
    >
      {/* Product Image */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {imageUri && !imageError ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.cardImage}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>📱</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {/* Stock Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>
              Only {product.stock} left!
            </Text>
          </View>
        )}

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Sold Out</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Category Badge */}
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: categoryInfo.color + "20" },
          ]}
        >
          <Text
            style={[styles.categoryBadgeText, { color: categoryInfo.color }]}
          >
            {categoryInfo.icon} {categoryInfo.name}
          </Text>
        </View>

        {/* Product Info */}
        <TouchableOpacity onPress={handlePress}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {product.description}
          </Text>
        </TouchableOpacity>

        {/* Price and Rating */}
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: categoryInfo.color }]}>
            ${product.price.toLocaleString()}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>{product.stock}</Text>
            <Text style={styles.ratingText}>In stock</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.detailsButton} onPress={handlePress}>
            <Text style={styles.detailsButtonText}>👁️ Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cartButton,
              {
                backgroundColor: categoryInfo.color,
                opacity: product.stock === 0 || addToCartLoading ? 0.6 : 1,
              },
            ]}
            onPress={handleAddToCart}
            disabled={product.stock === 0 || addToCartLoading}
          >
            <Text style={styles.cartButtonText}>
              {addToCartLoading
                ? "⏳ Adding..."
                : product.stock === 0
                ? "❌ Out of Stock"
                : "🛒 Add"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// CẬP NHẬT STYLES - Thêm styles cho cart icon
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
    fontWeight: "500",
  },

  // Header Styles - CẬP NHẬT
  headerContainer: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E50",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "500",
  },

  // Cart Icon Styles - MỚI
  cartIcon: {
    position: "relative",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartIconText: {
    fontSize: 24,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#E74C3C",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 4,
  },

  // Giữ nguyên tất cả styles khác...
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tab: {
    alignItems: "center",
    marginRight: 20,
    paddingVertical: 5,
  },
  tabActive: {
    transform: [{ scale: 1.05 }],
  },
  tabIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#E9ECEF",
  },
  tabIconActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#45B7D1",
    shadowColor: "#45B7D1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabIcon: {
    fontSize: 24,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C757D",
  },
  tabTextActive: {
    color: "#45B7D1",
    fontWeight: "700",
  },
  scrollContainer: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    justifyContent: "space-between",
  },
  card: {
    width: (width - 45) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  imageContainer: {
    height: 180,
    backgroundColor: "#F8F9FA",
    position: "relative",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECF0F1",
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: "#95A5A6",
    fontWeight: "500",
  },
  stockBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#E74C3C",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  outOfStockOverlay: {
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
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: "#E74C3C",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cardContent: {
    padding: 15,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 6,
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 12,
    color: "#7F8C8D",
    lineHeight: 16,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingStars: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 11,
    color: "#7F8C8D",
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C757D",
  },
  cartButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cartButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
  },
});

export default ProductsBySections;
