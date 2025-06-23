// screens/Orders/MyOrders.js
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders, getOrderDetails } from "../../redux/order/orderActions";
import Layout from "../../components/Layout/Layout";

const MyOrders = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Redux state
  const { orders, getMyOrdersLoading, error, message } = useSelector(
    (state) => state.order
  );

  // Load orders when component mounts
  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(getMyOrders());
    setRefreshing(false);
  }, [dispatch]);

  // Handle order press
  const handleOrderPress = (order) => {
    navigation.navigate("OrderDetails", { orderId: order._id });
  };

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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (getMyOrdersLoading && !refreshing) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </Layout>
    );
  }

  // Error state
  if (error && !orders?.length) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>Failed to load orders</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(getMyOrders())}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            You haven't placed any orders yet.{"\n"}Start shopping to see your
            orders here!
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.headerRight}>
            <Text style={styles.orderCount}>{orders.length} orders</Text>
          </View>
        </View> */}

        {/* Orders List */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onPress={() => handleOrderPress(order)}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              formatDate={formatDate}
            />
          ))}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </Layout>
  );
};

// Order Card Component
const OrderCard = ({
  order,
  onPress,
  getStatusColor,
  getStatusIcon,
  formatDate,
}) => {
  // Extract image from first item
  const getFirstItemImage = () => {
    if (order.orderItems && order.orderItems.length > 0) {
      const firstItem = order.orderItems[0];
      if (firstItem.image) {
        // Handle different image formats
        if (firstItem.image.startsWith("http")) {
          return firstItem.image;
        }
        if (firstItem.image.includes("url:")) {
          const match = firstItem.image.match(/url:\s*'([^']+)'/);
          return match ? match[1] : null;
        }
      }
    }
    return null;
  };

  const imageUri = getFirstItemImage();

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>
            Order #{order._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.orderStatus) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(order.orderStatus) },
            ]}
          >
            {getStatusIcon(order.orderStatus)} {order.orderStatus}
          </Text>
        </View>
      </View>

      {/* Order Content */}
      <View style={styles.orderContent}>
        {/* Product Preview */}
        <View style={styles.productPreview}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>📦</Text>
            </View>
          )}

          <View style={styles.productInfo}>
            <Text style={styles.itemCount}>
              {order.orderItems.length}{" "}
              {order.orderItems.length === 1 ? "item" : "items"}
            </Text>
            <Text style={styles.firstItemName} numberOfLines={1}>
              {order.orderItems[0]?.name}
              {order.orderItems.length > 1 &&
                ` +${order.orderItems.length - 1} more`}
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>
              {order.totalAmount?.toLocaleString("vi-USA")} $
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment:</Text>
            <Text style={styles.summaryValue}>
              {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online"}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Actions */}
      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
          <Text style={styles.viewDetailsText}>View Details →</Text>
        </TouchableOpacity>

        {order.orderStatus === "deliverd" && (
          <TouchableOpacity style={styles.reorderButton}>
            <Text style={styles.reorderText}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
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
    alignItems: "flex-end",
  },
  orderCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },

  // Order Card
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },

  // Order Header
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  // Order Content
  orderContent: {
    padding: 15,
  },
  productPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  firstItemName: {
    fontSize: 12,
    color: "#666",
  },

  // Order Summary
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
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

  // Order Actions
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "500",
  },
  reorderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#28a745",
    borderRadius: 6,
  },
  reorderText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
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
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Empty State
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MyOrders;
