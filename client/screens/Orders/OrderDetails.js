// screens/Orders/OrderDetails.js
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails } from "../../redux/order/orderActions";
import Layout from "../../components/Layout/Layout";

const OrderDetails = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { orderId } = route.params;

  // Redux state
  const { currentOrder, getOrderDetailsLoading, error } = useSelector(
    (state) => state.order
  );

  // Load order details when component mounts
  useEffect(() => {
    if (orderId) {
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "#ff9800";
      case "shipped":
        return "#2196f3";
      case "deliverd":
        return "#4caf50";
      default:
        return "#666";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return "⏳";
      case "shipped":
        return "🚚";
      case "deliverd":
        return "✅";
      default:
        return "📦";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get order status steps
  const getStatusSteps = (status) => {
    const steps = [
      { key: "processing", label: "Order Placed", icon: "📝" },
      { key: "shipped", label: "Shipped", icon: "🚚" },
      { key: "deliverd", label: "Delivered", icon: "✅" },
    ];

    const currentIndex = steps.findIndex((step) => step.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  // Loading state
  if (getOrderDetailsLoading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </Layout>
    );
  }

  // Error state
  if (error || !currentOrder) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>Order not found</Text>
          <Text style={styles.errorMessage}>
            {error ||
              "This order doesn't exist or you don't have permission to view it."}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  const statusSteps = getStatusSteps(currentOrder.orderStatus);

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.headerBackText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerRight} />
        </View> */}

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Info Card */}
          <View style={styles.card}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>
                  Order #{currentOrder._id.slice(-8).toUpperCase()}
                </Text>
                <Text style={styles.orderDate}>
                  Placed on {formatDate(currentOrder.createdAt)}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      getStatusColor(currentOrder.orderStatus) + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(currentOrder.orderStatus) },
                  ]}
                >
                  {getStatusIcon(currentOrder.orderStatus)}{" "}
                  {currentOrder.orderStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Status Timeline */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <View style={styles.timeline}>
              {statusSteps.map((step, index) => (
                <View key={step.key} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineIcon,
                        step.completed && styles.timelineIconCompleted,
                        step.active && styles.timelineIconActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timelineIconText,
                          step.completed && styles.timelineIconTextCompleted,
                        ]}
                      >
                        {step.icon}
                      </Text>
                    </View>
                    {index < statusSteps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          step.completed && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineRight}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        step.completed && styles.timelineLabelCompleted,
                        step.active && styles.timelineLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {step.active && (
                      <Text style={styles.timelineSubtext}>Current status</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Order Items ({currentOrder.orderItems.length})
            </Text>

            {currentOrder.orderItems.map((item, index) => (
              <OrderItemCard key={index} item={item} />
            ))}
          </View>

          {/* Shipping Information */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>
                {currentOrder.shippingInfo.address}
              </Text>
              <Text style={styles.addressText}>
                {currentOrder.shippingInfo.city},{" "}
                {currentOrder.shippingInfo.country}
              </Text>
            </View>
          </View>

          {/* Payment Information */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.paymentInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Method:</Text>
                <Text style={styles.infoValue}>
                  {currentOrder.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Status:</Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: currentOrder.paidAt ? "#4caf50" : "#ff9800" },
                  ]}
                >
                  {currentOrder.paidAt ? "Paid" : "Pending"}
                </Text>
              </View>

              {currentOrder.paidAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Paid At:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(currentOrder.paidAt)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>
                  {currentOrder.itemPrice?.toLocaleString("vi-VN")} VNĐ
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={styles.summaryValue}>
                  {currentOrder.tax?.toLocaleString("vi-VN")} VNĐ
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    currentOrder.shippingCharges === 0 && styles.freeText,
                  ]}
                >
                  {currentOrder.shippingCharges === 0
                    ? "FREE"
                    : `${currentOrder.shippingCharges?.toLocaleString(
                        "vi-VN"
                      )} VNĐ`}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  {currentOrder.totalAmount?.toLocaleString("vi-VN")} VNĐ
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {currentOrder.orderStatus === "deliverd" && (
              <TouchableOpacity style={styles.reorderButton}>
                <Text style={styles.reorderButtonText}>Reorder Items</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.supportButton}
              onPress={() =>
                Alert.alert(
                  "Support",
                  "Contact customer support for help with this order."
                )
              }
            >
              <Text style={styles.supportButtonText}>Need Help?</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </Layout>
  );
};

// Order Item Card Component
const OrderItemCard = ({ item }) => {
  const getImageUri = () => {
    if (!item.image) return null;

    if (item.image.startsWith("http")) {
      return item.image;
    }

    if (item.image.includes("url:")) {
      const match = item.image.match(/url:\s*'([^']+)'/);
      return match ? match[1] : null;
    }

    return null;
  };

  const imageUri = getImageUri();

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemImageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Text style={styles.itemImagePlaceholderText}>📦</Text>
          </View>
        )}
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price?.toLocaleString("vi-VN")} VNĐ
        </Text>
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
      </View>

      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalPrice}>
          {(item.price * item.quantity)?.toLocaleString("vi-VN")} VNĐ
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  headerBackText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Order Header
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },

  // Timeline
  timeline: {
    paddingLeft: 5,
  },
  timelineItem: {
    flexDirection: "row",
    paddingBottom: 20,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 15,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  timelineIconCompleted: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  timelineIconActive: {
    backgroundColor: "#2196f3",
    borderColor: "#2196f3",
  },
  timelineIconText: {
    fontSize: 16,
  },
  timelineIconTextCompleted: {
    color: "#fff",
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: "#e0e0e0",
    marginTop: 5,
  },
  timelineLineCompleted: {
    backgroundColor: "#4caf50",
  },
  timelineRight: {
    flex: 1,
    paddingTop: 8,
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  timelineLabelCompleted: {
    color: "#4caf50",
    fontWeight: "600",
  },
  timelineLabelActive: {
    color: "#2196f3",
    fontWeight: "600",
  },
  timelineSubtext: {
    fontSize: 12,
    color: "#2196f3",
    marginTop: 2,
  },

  // Item Card
  itemCard: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  itemImagePlaceholderText: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666",
  },
  itemTotal: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  // Address
  addressContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },

  // Payment Info
  paymentInfo: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  // Summary
  summaryContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
    color: "#4caf50",
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2196f3",
  },

  // Actions
  actionsContainer: {
    marginTop: 10,
  },
  reorderButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  reorderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  supportButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  supportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Error States
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OrderDetails;
