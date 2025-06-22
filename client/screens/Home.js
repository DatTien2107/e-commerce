// Home.js - FIXED VERSION (No Stretch)
import { StyleSheet, ScrollView, View } from "react-native";
import React, { useEffect } from "react";
import Categories from "../components/category/Category";
import Banner from "../components/Banner/Banner";

import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { useDispatch } from "react-redux";
import { getUserData } from "../redux/features-auth/userActions";
import { useNavigation } from "@react-navigation/native";
// import Products from "../components/Products/Products";

import ProductsBySections from "../components/Products/ProductByCategory";

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      {/* Main Content - Scrollable */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false} // Disable bouncing to prevent stretch
        overScrollMode="never" // Disable over-scroll
      >
        <Header />
        <Categories />
        <Banner />
        {/* <Products navigation={navigation} /> */}

        <ProductsBySections navigation={navigation} />
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <Footer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for footer
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default Home;
