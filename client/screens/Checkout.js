// screens/Checkout/Checkout.js
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, processPayment } from "../redux/order/orderActions";
import { getCart, clearCart } from "../redux/cart/cartActions";
import Layout from "../components/Layout/Layout";

const Checkout = ({ navigation }) => {
  const dispatch = useDispatch();

  // Redux state
  const { cart } = useSelector((state) => state.cart);
  const { createOrderLoading, processPaymentLoading, error, message } =
    useSelector((state) => state.order);

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    country: "Vietnam",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isFormValid, setIsFormValid] = useState(false);

  // Load cart if not already loaded
  useEffect(() => {
    if (!cart.cartItems || cart.cartItems.length === 0) {
      dispatch(getCart());
    }
  }, [dispatch, cart.cartItems]);

  // Validate form
  useEffect(() => {
    const isValid =
      shippingInfo.address.trim() !== "" &&
      shippingInfo.city.trim() !== "" &&
      shippingInfo.country.trim() !== "";
    setIsFormValid(isValid);
  }, [shippingInfo]);

  // Calculate pricing
  const calculatePricing = () => {
    const itemPrice = cart.totalAmount || 0;
    const tax = Math.round(itemPrice * 0.1); // 10% tax
    const shippingCharges = itemPrice > 500000 ? 0 : 30000; // Free shipping over 500k VND
    const totalAmount = itemPrice + tax + shippingCharges;

    return {
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    };
  };

  const { itemPrice, tax, shippingCharges, totalAmount } = calculatePricing();

  // Handle input change
  const handleInputChange = (field, value) => {
    setShippingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Validation Error",
        "Please fill in all shipping information"
      );
      return;
    }

    if (!cart.cartItems || cart.cartItems.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty");
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        shippingInfo,
        orderItems: cart.cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          product:
            typeof item.product === "object" ? item.product._id : item.product,
        })),
        paymentMethod,
        paymentInfo: paymentMethod === "COD" ? { status: "pending" } : {},
        itemPrice,
        tax,
        shippingCharges,
        totalAmount,
      };

      console.log("📦 Placing order:", orderData);

      // If online payment, process payment first
      if (paymentMethod === "ONLINE") {
        console.log("💳 Processing online payment...");
        const paymentResult = await dispatch(processPayment(totalAmount));

        if (!paymentResult.success) {
          Alert.alert("Payment Error", paymentResult.message);
          return;
        }

        // Add payment info to order
        orderData.paymentInfo = {
          id: paymentResult.clientSecret,
          status: "paid",
        };
        orderData.paidAt = new Date();
      }

      // Create order
      const result = await dispatch(createOrder(orderData));

      if (result.success) {
        // Clear cart after successful order
        await dispatch(clearCart());

        // Show success message
        Alert.alert(
          "Order Placed Successfully! 🎉",
          `Your order has been placed successfully. ${
            paymentMethod === "COD"
              ? "You will pay on delivery."
              : "Payment processed."
          }`,
          [
            {
              text: "View Orders",
              onPress: () => navigation.navigate("MyOrders"),
            },
            {
              text: "Continue Shopping",
              onPress: () => navigation.navigate("Home"),
            },
          ]
        );
      } else {
        Alert.alert("Order Error", result.message);
      }
    } catch (error) {
      console.error("❌ Order placement error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  // If cart is empty
  if (!cart.cartItems || cart.cartItems.length === 0) {
    return (
      <Layout>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items to cart before checkout
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>Checkout</Text>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full address"
              value={shippingInfo.address}
              onChangeText={(value) => handleInputChange("address", value)}
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={shippingInfo.city}
                onChangeText={(value) => handleInputChange("city", value)}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Country *</Text>
              <TextInput
                style={styles.input}
                placeholder="Country"
                value={shippingInfo.country}
                onChangeText={(value) => handleInputChange("country", value)}
              />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "COD" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod("COD")}
          >
            <View style={styles.radio}>
              {paymentMethod === "COD" && <View style={styles.radioSelected} />}
            </View>
            <View>
              <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSubtext}>
                Pay when you receive your order
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "ONLINE" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod("ONLINE")}
          >
            <View style={styles.radio}>
              {paymentMethod === "ONLINE" && (
                <View style={styles.radioSelected} />
              )}
            </View>
            <View>
              <Text style={styles.paymentText}>Online Payment</Text>
              <Text style={styles.paymentSubtext}>
                Pay now with credit/debit card
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({cart.totalItems}):</Text>
            <Text style={styles.summaryValue}>
              {itemPrice.toLocaleString()} VNĐ
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (10%):</Text>
            <Text style={styles.summaryValue}>{tax.toLocaleString()} VNĐ</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text
              style={[
                styles.summaryValue,
                shippingCharges === 0 && styles.freeText,
              ]}
            >
              {shippingCharges === 0
                ? "FREE"
                : `${shippingCharges.toLocaleString()} VNĐ`}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {totalAmount.toLocaleString()} VNĐ
            </Text>
          </View>
        </View>

        {/* Error/Success Messages */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {message && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        )}

        {/* Place Order Button */}
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!isFormValid || createOrderLoading || processPaymentLoading) &&
              styles.disabledButton,
          ]}
          onPress={handlePlaceOrder}
          disabled={!isFormValid || createOrderLoading || processPaymentLoading}
        >
          <Text style={styles.placeOrderText}>
            {createOrderLoading || processPaymentLoading
              ? "Processing..."
              : `Place Order - ${totalAmount.toLocaleString()} VNĐ`}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 0.48,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: "#007bff",
    backgroundColor: "#f0f8ff",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007bff",
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  paymentSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  freeText: {
    color: "#28a745",
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007bff",
  },
  errorContainer: {
    backgroundColor: "#ffe6e6",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: "#e8f5e8",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  successText: {
    color: "#2e7d32",
    textAlign: "center",
    fontSize: 14,
  },
  placeOrderButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  shopButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Checkout;
