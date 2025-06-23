// screens/Admin/Dashboard.js - Updated with navigation
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import Layout from "../../components/Layout/Layout";
import AntDesign from "react-native-vector-icons/AntDesign";

const Dashboard = ({ navigation }) => {
  // Navigation handlers
  const handleManageProducts = () => {
    // navigation.navigate("ManageProducts");
    console.log("Navigate to Manage Products");
  };

  const handleManageCategories = () => {
    // navigation.navigate("ManageCategories");
    console.log("Navigate to Manage Categories");
  };

  const handleManageUsers = () => {
    // navigation.navigate("ManageUsers");
    console.log("Navigate to Manage Users");
  };

  const handleManageOrders = () => {
    navigation.navigate("ManageOrders");
  };

  const handleAboutApp = () => {
    // navigation.navigate("AboutApp");
    console.log("Navigate to About App");
  };

  return (
    <Layout>
      <View style={styles.main}>
        <Text style={styles.heading}>Admin Dashboard</Text>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.btn} onPress={handleManageProducts}>
            <AntDesign style={styles.icon} name="edit" />
            <Text style={styles.btnText}>Manage Products</Text>
            <AntDesign style={styles.arrow} name="arrowright" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleManageCategories}>
            <AntDesign style={styles.icon} name="tags" />
            <Text style={styles.btnText}>Manage Categories</Text>
            <AntDesign style={styles.arrow} name="arrowright" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleManageUsers}>
            <AntDesign style={styles.icon} name="user" />
            <Text style={styles.btnText}>Manage Users</Text>
            <AntDesign style={styles.arrow} name="arrowright" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.ordersBtn]}
            onPress={handleManageOrders}
          >
            <AntDesign style={[styles.icon, styles.ordersIcon]} name="bars" />
            <Text style={[styles.btnText, styles.ordersBtnText]}>
              Manage Orders
            </Text>
            <AntDesign
              style={[styles.arrow, styles.ordersArrow]}
              name="arrowright"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleAboutApp}>
            <AntDesign style={styles.icon} name="info" />
            <Text style={styles.btnText}>About App</Text>
            <AntDesign style={styles.arrow} name="arrowright" />
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: "lightgray",
    height: "96%",
  },
  heading: {
    backgroundColor: "#000000",
    color: "#ffffff",
    textAlign: "center",
    padding: 10,
    fontSize: 20,
    margin: 10,
    borderRadius: 5,
    fontWeight: "bold",
  },
  btnContainer: {
    margin: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    fontSize: 25,
    marginRight: 10,
    marginLeft: 10,
    color: "#333",
  },
  btnText: {
    fontSize: 18,
    flex: 1,
    color: "#333",
  },
  arrow: {
    fontSize: 18,
    color: "#666",
    marginRight: 10,
  },
  // Special styling for Manage Orders button
  ordersBtn: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  ordersIcon: {
    color: "#2196f3",
  },
  ordersBtnText: {
    color: "#2196f3",
    fontWeight: "bold",
  },
  ordersArrow: {
    color: "#2196f3",
  },
});

export default Dashboard;
