// components/cart/PriceTable.js
import { View, Text, StyleSheet } from "react-native";
import React from "react";

const PriceTable = ({ title, price, isFree = false }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.price, isFree && styles.freePrice]}>
        {isFree ? "FREE" : `$${price?.toLocaleString()}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: "lightgray",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007bff",
  },
  freePrice: {
    color: "#28a745",
    fontWeight: "700",
  },
});

export default PriceTable;
