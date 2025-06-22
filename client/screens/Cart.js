// screens/Cart/Cart.js
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../redux/cart/cartActions";
import PriceTable from "../components/cart/PriceTable";
import Layout from "../components/Layout/Layout";
import CartItem from "../components/cart/CartItem";

const Cart = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Get cart data from Redux
  const {
    cart,
    cartCount,
    loading,
    getCartLoading,
    updateCartLoading,
    removeFromCartLoading,
    clearCartLoading,
    error,
    message,
  } = useSelector((state) => state.cart);

  // Get cart items
  const cartItems = cart?.cartItems || [];
  const totalItems = cart?.totalItems || 0;
  const totalAmount = cart?.totalAmount || 0;

  // Load cart khi component mount
  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(getCart());
    setRefreshing(false);
  }, [dispatch]);

  // Calculate pricing
  const calculatePricing = () => {
    const subtotal = totalAmount;
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const shipping = subtotal > 500000 ? 0 : 30000; // Free shipping over 500k VND, otherwise 30k VND
    const grandTotal = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      grandTotal,
    };
  };

  const { subtotal, tax, shipping, grandTotal } = calculatePricing();

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to cart before checkout.");
      return;
    }
    navigation.navigate("checkout", {
      cart: cart,
      pricing: { subtotal, tax, shipping, grandTotal },
    });
  };

  // Handle clear cart
  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            const result = await dispatch(clearCart());
            if (result?.success) {
              Alert.alert("Success", "Cart cleared successfully!");
            }
          },
        },
      ]
    );
  };

  return (
    <Layout>
      {/* Header with clear button */}
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>
          {cartItems?.length > 0
            ? `You have ${totalItems} ${
                totalItems === 1 ? "item" : "items"
              } in your cart`
            : "Oops your cart is empty"}
        </Text>

        {cartItems?.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
            disabled={clearCartLoading}
          >
            <Text style={styles.clearButtonText}>
              {clearCartLoading ? "Clearing..." : "Clear All"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading state */}
      {getCartLoading && !refreshing && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      )}

      {/* Error state */}
      {error && cartItems.length === 0 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(getCart())}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty cart */}
      {cartItems.length === 0 && !getCartLoading && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate("home")}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cart items */}
      {cartItems.length > 0 && (
        <>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            {cartItems?.map((item, index) => (
              <CartItem
                item={item}
                key={`${item.product}-${index}`}
                updateCartLoading={updateCartLoading}
                removeFromCartLoading={removeFromCartLoading}
              />
            ))}
          </ScrollView>

          {/* Price breakdown */}
          <View style={styles.priceSection}>
            <PriceTable title={"Subtotal"} price={subtotal} />
            <PriceTable title={"Tax (10%)"} price={tax} />
            <PriceTable
              title={"Shipping"}
              price={shipping}
              isFree={shipping === 0}
            />
            <View style={styles.grandTotal}>
              <PriceTable title={"Grand Total"} price={grandTotal} />
            </View>

            {/* Checkout button */}
            <TouchableOpacity
              style={[
                styles.btnCheckout,
                (loading || cartItems.length === 0) &&
                  styles.btnCheckoutDisabled,
              ]}
              onPress={handleCheckout}
              disabled={loading || cartItems.length === 0}
            >
              <Text style={styles.btnCheckoutText}>
                {loading ? "PROCESSING..." : "CHECKOUT"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  heading: {
    flex: 1,
    textAlign: "center",
    color: "green",
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },

  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  shopButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Scroll view
  scrollView: {
    flex: 1,
    marginBottom: 10,
  },

  // Price section
  priceSection: {
    backgroundColor: "#f8f9fa",
    paddingTop: 15,
  },
  grandTotal: {
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "#ffffff",
    padding: 5,
    margin: 5,
  },
  btnCheckout: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    backgroundColor: "#000000",
    width: "90%",
    marginHorizontal: 20,
    borderRadius: 5,
  },
  btnCheckoutDisabled: {
    backgroundColor: "#cccccc",
  },
  btnCheckoutText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default Cart;
