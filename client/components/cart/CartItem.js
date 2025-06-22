// components/cart/CartItem.js
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateCartItem, removeFromCart } from "../../redux/cart/cartActions";

const CartItem = ({ item, updateCartLoading, removeFromCartLoading }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(item.quantity);
  const [imageError, setImageError] = useState(false);

  // Debug log để xem cấu trúc item
  console.log("🔍 CartItem debug:", {
    itemProduct: item.product,
    itemProductType: typeof item.product,
    itemProductId: item.product?._id || item.product,
    fullItem: item,
  });

  // Handle quantity update
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    // Lấy productId đúng cách
    const productId =
      typeof item.product === "object"
        ? item.product._id || item.product.id
        : item.product;

    console.log(
      "🔄 Updating quantity with productId:",
      productId,
      "newQuantity:",
      newQuantity
    );

    setQuantity(newQuantity);
    const result = await dispatch(updateCartItem(productId, newQuantity));

    if (!result?.success) {
      // Revert quantity if update failed
      setQuantity(item.quantity);
      Alert.alert("Error", result?.message || "Failed to update quantity");
    }
  };

  // Handle remove item
  const handleRemoveItem = () => {
    // Lấy productId đúng cách
    const productId =
      typeof item.product === "object"
        ? item.product._id || item.product.id
        : item.product;

    console.log("🗑️ Removing item with productId:", productId);

    Alert.alert("Remove Item", `Remove ${item.name} from cart?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const result = await dispatch(removeFromCart(productId));
          if (result?.success) {
            Alert.alert("Removed", "Item removed from cart");
          } else {
            Alert.alert("Error", result?.message || "Failed to remove item");
          }
        },
      },
    ]);
  };

  // Extract image URL (handle different image formats)
  const getImageUri = () => {
    if (!item.image) return null;

    // If it's already a direct URL
    if (item.image.startsWith("http")) {
      return item.image;
    }

    // If it's an object string, extract URL
    if (item.image.includes("url:")) {
      const match = item.image.match(/url:\s*'([^']+)'/);
      return match ? match[1] : null;
    }

    return null;
  };

  const imageUri = getImageUri();

  return (
    <View style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {imageUri && !imageError ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>📱</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.price}>${item.price?.toLocaleString()}</Text>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              (quantity <= 1 || updateCartLoading) && styles.buttonDisabled,
            ]}
            onPress={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || updateCartLoading}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>

          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              updateCartLoading && styles.buttonDisabled,
            ]}
            onPress={() => handleQuantityChange(quantity + 1)}
            disabled={updateCartLoading}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {/* Total Price */}
        <Text style={styles.totalPrice}>
          ${(item.price * quantity)?.toLocaleString()}
        </Text>

        {/* Remove Button */}
        <TouchableOpacity
          style={[
            styles.removeButton,
            removeFromCartLoading && styles.buttonDisabled,
          ]}
          onPress={handleRemoveItem}
          disabled={removeFromCartLoading}
        >
          <Text style={styles.removeButtonText}>
            {removeFromCartLoading ? "..." : "🗑️"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Image styles
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholderText: {
    fontSize: 30,
  },

  // Info styles
  infoContainer: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },

  // Quantity styles
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  quantityDisplay: {
    marginHorizontal: 15,
    minWidth: 30,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Actions styles
  actionsContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingLeft: 10,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 10,
  },
  removeButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#ffe6e6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffcccc",
  },
  removeButtonText: {
    fontSize: 16,
  },
});

export default CartItem;
