// components/Banner/Banner.js
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import Carousel, { PaginationLight } from "react-native-x-carousel";
import { BannerData } from "../../data/BannerData";

const { width } = Dimensions.get("window");

const Banner = ({ navigation }) => {
  const handleBannerPress = (bannerItem) => {
    console.log("🎯 Banner pressed:", bannerItem);

    // LUÔN navigate tới ProductsBySections với category params
    if (bannerItem.categoryId || bannerItem.category) {
      const categoryToPass = bannerItem.categoryId || bannerItem.category;
      const categoryName =
        bannerItem.categoryName || bannerItem.cornerLabelText;

      console.log(
        "🎯 Navigating to ProductsBySections with category:",
        categoryToPass
      );

      navigation.navigate("cart", {
        selectedCategory: categoryToPass,
        categoryName: categoryName,
      });
    } else {
      // Default navigate tới ProductsBySections (all products)
      console.log("🎯 Navigating to ProductsBySections (all products)");
      navigation.navigate("ProductsBySections");
    }
  };

  const renderItem = (data) => (
    <View key={data.coverImageUri} style={styles.cardContainer}>
      <Pressable onPress={() => handleBannerPress(data)}>
        <View style={styles.cardWrapper}>
          <Image style={styles.card} source={{ uri: data.coverImageUri }} />
          <View
            style={[
              styles.cornerLabel,
              { backgroundColor: data.cornerLabelColor },
            ]}
          >
            <Text style={styles.cornerLabelText}>{data.cornerLabelText}</Text>
          </View>

          {/* Thêm overlay với call-to-action */}
          <View style={styles.overlay}>
            <Text style={styles.bannerTitle}>{data.title || "Shop Now"}</Text>
            <Text style={styles.bannerSubtitle}>
              {data.subtitle || "Great deals await!"}
            </Text>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>Shop Now →</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Carousel
        pagination={PaginationLight}
        renderItem={renderItem}
        data={BannerData}
        loop
        autoplay
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    alignItems: "center",
    justifyContent: "center",
    width,
  },
  cardWrapper: {
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  card: {
    width: width * 1,
    height: width * 0.5,
  },
  cornerLabel: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderTopLeftRadius: 8,
    zIndex: 3,
  },
  cornerLabelText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
  },

  // Overlay styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  bannerTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ctaButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  ctaText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Banner;
