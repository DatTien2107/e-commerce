// Layout.js - FIXED VERSION (No Stretch)
import { View, StatusBar, StyleSheet, SafeAreaView } from "react-native";
import React from "react";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Content - Fixed height to prevent stretching */}
      <View style={styles.content}>{children}</View>

      {/* Footer - Fixed position */}
      <View style={styles.footer}>
        <Footer />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    overflow: "hidden", // Prevent content overflow
  },
  footer: {
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

export default Layout;
