// screens/Admin/ManageOrders.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../components/Layout/Layout";
import AdminOrderItem from "../Admin/AdminOrderItem";
import {
  getAllOrders,
  changeOrderStatus,
  clearOrderMessages,
  clearOrderErrors,
} from "../../redux/order/orderActions";
import AntDesign from "react-native-vector-icons/AntDesign";

const ManageOrders = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Redux state
  const {
    allOrders,
    getAllOrdersLoading,
    changeOrderStatusLoading,
    message,
    error,
  } = useSelector((state) => state.order);

  // Load orders khi component mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Handle messages và errors
  useEffect(() => {
    if (message) {
      Alert.alert("Success", message);
      dispatch(clearOrderMessages());
    }
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearOrderErrors());
    }
  }, [message, error, dispatch]);

  // Load orders function
  const loadOrders = async () => {
    try {
      console.log("📋 Loading all orders for admin...");
      await dispatch(getAllOrders());
    } catch (error) {
      console.log("❌ Error loading orders:", error);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // Handle change order status
  const handleChangeOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Changing order ${orderId} to ${newStatus}`);

      Alert.alert(
        "Confirm Status Change",
        `Are you sure you want to change this order status to "${newStatus}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            onPress: async () => {
              const result = await dispatch(
                changeOrderStatus(orderId, newStatus)
              );
              if (result.success) {
                console.log("✅ Order status changed successfully");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.log("❌ Error changing order status:", error);
    }
  };

  // Auto advance order status (legacy)
  const handleAutoAdvanceStatus = async (orderId) => {
    try {
      Alert.alert(
        "Auto Advance Status",
        "This will automatically advance the order to the next status. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Advance",
            onPress: async () => {
              const result = await dispatch(changeOrderStatus(orderId)); // No newStatus = auto advance
              if (result.success) {
                console.log("✅ Order status auto-advanced successfully");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.log("❌ Error auto-advancing order status:", error);
    }
  };

  // Get status counts for dashboard
  const getStatusCounts = () => {
    const counts = {
      processing: 0,
      shipped: 0,
      deliverd: 0,
      total: allOrders.length,
    };

    allOrders.forEach((order) => {
      counts[order.orderStatus] = (counts[order.orderStatus] || 0) + 1;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heading}>Manage Orders</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <AntDesign name="reload1" size={20} color="#fff" />
          </TouchableOpacity>
        </View> */}

        {/* Stats Dashboard */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statusCounts.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#ff9800" }]}>
              {statusCounts.processing}
            </Text>
            <Text style={styles.statLabel}>Processing</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#2196f3" }]}>
              {statusCounts.shipped}
            </Text>
            <Text style={styles.statLabel}>Shipped</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#4caf50" }]}>
              {statusCounts.deliverd}
            </Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
        </View>

        {/* Orders List */}
        <ScrollView
          style={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {getAllOrdersLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : allOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AntDesign name="inbox" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          ) : (
            allOrders.map((order) => (
              <AdminOrderItem
                key={order._id}
                order={order}
                onChangeStatus={handleChangeOrderStatus}
                onAutoAdvance={handleAutoAdvanceStatus}
                isLoading={changeOrderStatusLoading}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000000",
    padding: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  heading: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  refreshButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
    elevation: 3,
    paddingVertical: 15,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    padding: 50,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
});

export default ManageOrders;
