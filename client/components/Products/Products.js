// components/Products/Products.js - Updated with API
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import React, { useEffect } from "react";
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
      // You can show an alert or toast here
    }
  }, [error]);

  // Show loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Loading products...</Text>
      </View>
    );
  }

  // Show error state
  if (error && (!products || products.length === 0)) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "red", marginBottom: 10 }}>
          Failed to load products
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(getAllProducts())}
        >
          <Text style={{ color: "white" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show empty state
  if (!products || products.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>No products available</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(getAllProducts())}
        >
          <Text style={{ color: "white" }}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log("Rendering products:", products.length);

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.headingText}>
          Products ({totalProducts || products.length})
        </Text>
        <TouchableOpacity onPress={() => dispatch(getAllProducts())}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.productsContainer}>
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              navigation={navigation}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Individual Product Card Component
const ProductCard = ({ product, navigation }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation?.navigate("productDetails", { productId: product._id })
      }
    >
      <Image
        style={styles.cardImage}
        source={{
          uri: product.images?.[0]?.url || "https://via.placeholder.com/200",
        }}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price}</Text>
          {product.rating > 0 && (
            <Text style={styles.rating}>⭐ {product.rating.toFixed(1)}</Text>
          )}
        </View>
        <Text style={styles.stock}>
          {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    margin: 10,
    borderRadius: 10,
    elevation: 5,
    padding: 10,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  refreshText: {
    color: "#007bff",
    fontSize: 14,
  },
  productsContainer: {
    flexDirection: "row",
  },
  card: {
    width: width * 0.6,
    backgroundColor: "#f8f9fa",
    marginRight: 15,
    borderRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: {
    height: 120,
    width: "100%",
    resizeMode: "cover",
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  cardDesc: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
  },
  rating: {
    fontSize: 12,
    color: "#ffc107",
  },
  stock: {
    fontSize: 10,
    color: "#6c757d",
  },
  retryButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default Products;
