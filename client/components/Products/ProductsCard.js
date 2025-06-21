import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";

const ProductsCard = ({ p }) => {
  const navigation = useNavigation();
  const [imageError, setImageError] = useState(false);

  const getImageUri = () => {
    if (p.images && p.images.length > 0) {
      return p.images[0].url; // This matches your API structure
    }
    return null;
  };

  const imageUri = getImageUri();

  console.log("🛍️ ProductCard:", {
    name: p.name,
    hasImages: p.images?.length > 0,
    imageUri: imageUri,
  });

  const handleMoreButton = (id) => {
    navigation.navigate("productDetails", { _id: id });
    console.log("🔍 Navigate to product:", id);
  };

  const handleAddToCard = () => {
    alert(`Added ${p.name} to cart!`);
    console.log("🛒 Add to cart:", p.name);
  };

  const handleImageLoad = () => {
    console.log("✅ Image loaded:", p.name);
  };

  const handleImageError = (error) => {
    console.log("❌ Image error for:", p.name, error.nativeEvent);
    setImageError(true);
  };

  return (
    <View>
      <View style={styles.card}>
        {/* ✅ Fixed Image with proper error handling */}
        {imageUri && !imageError ? (
          <Image
            style={styles.cardImage}
            source={{ uri: imageUri }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardImage, styles.imagePlaceholder]}>
            <Text style={styles.placeholderIcon}>📱</Text>
            <Text style={styles.placeholderText}>
              {imageError ? "Image Error" : "No Image"}
            </Text>
          </View>
        )}

        <Text style={styles.cardTitle}>{p.name}</Text>
        <Text style={styles.cardDesc}>
          {p.description.substring(0, 30)} ...more
        </Text>

        {/* Price display */}
        <Text style={styles.price}>${p.price}</Text>

        {/* Stock info */}
        <Text style={styles.stock}>
          {p.stock > 0 ? `In Stock (${p.stock})` : "Out of Stock"}
        </Text>

        <View style={styles.BtnContainer}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleMoreButton(p._id)}
          >
            <Text style={styles.btnText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnCart, p.stock === 0 && styles.btnDisabled]}
            onPress={handleAddToCard}
            disabled={p.stock === 0}
          >
            <Text style={styles.btnText}>ADD TO CART</Text>
          </TouchableOpacity>
        </View>

        {/* Debug info - Remove in production */}
        <Text style={styles.debugText}>
          IMG: {imageUri ? "✅" : "❌"} | ERR: {imageError ? "YES" : "NO"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "lightgray",
    marginVertical: 5,
    marginHorizontal: 8,
    width: "45%",
    padding: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardImage: {
    height: 120,
    width: "100%",
    marginBottom: 10,
    borderRadius: 5,
  },
  imagePlaceholder: {
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderStyle: "dashed",
  },
  placeholderIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 10,
    color: "#6c757d",
    textAlign: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#212529",
  },
  cardDesc: {
    fontSize: 10,
    textAlign: "left",
    color: "#6c757d",
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 3,
  },
  stock: {
    fontSize: 9,
    color: "#6c757d",
    marginBottom: 8,
  },
  BtnContainer: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  btn: {
    backgroundColor: "#000000",
    height: 25,
    width: 75,
    borderRadius: 5,
    justifyContent: "center",
  },
  btnCart: {
    backgroundColor: "orange",
    height: 25,
    width: 75,
    borderRadius: 5,
    justifyContent: "center",
  },
  btnDisabled: {
    backgroundColor: "#6c757d",
  },
  btnText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
  debugText: {
    fontSize: 8,
    color: "#dc3545",
    marginTop: 5,
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    padding: 2,
    borderRadius: 2,
  },
});

export default ProductsCard;
