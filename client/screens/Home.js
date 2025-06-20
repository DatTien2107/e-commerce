import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Layout from "../components/Layout/Layout";
import Category from "../components/category/Category";
import Banner from "../components/Banner/Banner";
import Products from "../components/Products/Products";

const Home = () => {
  return (
    <Layout>
      <Category />
      <Banner />
      <Products />
    </Layout>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
