import { View, Text } from "react-native";
import React from "react";
import Layout from "../../components/Layout/Layout";

const Notification = () => {
  return (
    <Layout>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Text>You dont have any notification yet</Text>
      </View>
    </Layout>
  );
};

export default Notification;
