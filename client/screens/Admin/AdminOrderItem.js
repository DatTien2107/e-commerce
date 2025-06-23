// components/Admin/AdminOrderItem.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

const AdminOrderItem = ({
  order,
  onChangeStatus,
  onAutoAdvance,
  isLoading,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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
        return "clockcircle";
      case "shipped":
        return "car";
      case "deliverd":
        return "checkcircle";
      default:
        return "questioncircle";
    }
  };

  // Available status options
  const statusOptions = [
    { value: "processing", label: "Processing", color: "#ff9800" },
    { value: "shipped", label: "Shipped", color: "#2196f3" },
    { value: "deliverd", label: "Delivered", color: "#4caf50" },
  ];

  // Handle status selection
  const handleStatusSelect = (newStatus) => {
    setShowStatusModal(false);
    if (newStatus !== order.orderStatus) {
      onChangeStatus(order._id, newStatus);
    }
  };

  // Calculate total quantity
  const getTotalQuantity = () => {
    return (
      order.orderItems?.reduce((total, item) => total + item.quantity, 0) || 0
    );
  };

  return (
    <View style={styles.container}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>#{order._id.slice(-8)}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={styles.statusContainer}>
          <AntDesign
            name={getStatusIcon(order.orderStatus)}
            size={16}
            color={getStatusColor(order.orderStatus)}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(order.orderStatus) },
            ]}
          >
            {order.orderStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Customer Info */}
      {order.user && (
        <View style={styles.customerInfo}>
          <AntDesign name="user" size={14} color="#666" />
          <Text style={styles.customerText}>
            Customer ID: {order.user._id || order.user}
          </Text>
        </View>
      )}

      {/* Order Details */}
      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Items:</Text>
          <Text style={styles.detailValue}>{getTotalQuantity()} items</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total:</Text>
          <Text style={styles.detailValue}>${order.totalAmount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment:</Text>
          <Text style={styles.detailValue}>{order.paymentMethod}</Text>
        </View>
        {order.deliverdAt && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivered:</Text>
            <Text style={styles.detailValue}>
              {formatDate(order.deliverdAt)}
            </Text>
          </View>
        )}
      </View>

      {/* Shipping Address */}
      {order.shippingInfo && (
        <View style={styles.shippingInfo}>
          <AntDesign name="enviromento" size={14} color="#666" />
          <Text style={styles.shippingText}>
            {order.shippingInfo.address}, {order.shippingInfo.city},{" "}
            {order.shippingInfo.country}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {/* Change Status Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.changeStatusButton]}
          onPress={() => setShowStatusModal(true)}
          disabled={isLoading}
        >
          <AntDesign name="edit" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Change Status</Text>
        </TouchableOpacity>

        {/* Auto Advance Button */}
        {order.orderStatus !== "deliverd" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.autoAdvanceButton]}
            onPress={() => onAutoAdvance(order._id)}
            disabled={isLoading}
          >
            <AntDesign name="arrowright" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Auto Advance</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Selection Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Order Status</Text>
              <TouchableOpacity
                onPress={() => setShowStatusModal(false)}
                style={styles.modalCloseButton}
              >
                <AntDesign name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Order #{order._id.slice(-8)}
            </Text>
            <Text style={styles.currentStatusText}>
              Current Status: {order.orderStatus.toUpperCase()}
            </Text>

            <View style={styles.statusOptionsContainer}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusOption,
                    order.orderStatus === status.value &&
                      styles.currentStatusOption,
                  ]}
                  onPress={() => handleStatusSelect(status.value)}
                  disabled={order.orderStatus === status.value}
                >
                  <AntDesign
                    name={getStatusIcon(status.value)}
                    size={20}
                    color={status.color}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: status.color },
                      order.orderStatus === status.value &&
                        styles.currentStatusOptionText,
                    ]}
                  >
                    {status.label}
                  </Text>
                  {order.orderStatus === status.value && (
                    <AntDesign name="check" size={16} color={status.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginVertical: 8,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  customerText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  orderDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  shippingInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  shippingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
    flex: 1,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 2,
  },
  changeStatusButton: {
    backgroundColor: "#2196f3",
  },
  autoAdvanceButton: {
    backgroundColor: "#ff9800",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    margin: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  currentStatusText: {
    fontSize: 14,
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },
  statusOptionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "transparent",
  },
  currentStatusOption: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    flex: 1,
  },
  currentStatusOptionText: {
    color: "#2196f3",
  },
});

export default AdminOrderItem;
