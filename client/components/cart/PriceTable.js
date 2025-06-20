import { View, Text } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";

const PriceTable = ({ price, title }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
      <Text>{price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    alignItems: "center",
  },
});
export default PriceTable;
