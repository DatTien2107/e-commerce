import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AntDesign from "react-native-vector-icons/AntDesign";

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../../redux/features-auth/userActions";

const Account = ({ navigation }) => {
  const dispatch = useDispatch();

  // Get user data from Redux store
  const { user, loading, error } = useSelector((state) => state.user);

  // Fetch user data when component mounts
  useEffect(() => {
    console.log("Account component mounted, fetching user data...");
    dispatch(getUserData());
  }, [dispatch]);

  // Handle error
  useEffect(() => {
    if (error) {
      console.log("Account error:", error);
      // Optionally show alert or handle error
      // alert(error);
    }
  }, [error]);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text>Loading user data...</Text>
        </View>
      </Layout>
    );
  }

  // Show error state
  if (error && !user) {
    return (
      <Layout>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ color: "red" }}>Error loading user data</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => dispatch(getUserData())}
          >
            <Text>Retry</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  // Show user data or fallback
  const userData = user || {
    name: "Guest",
    email: "Not available",
    phone: "Not available",
    profilePic: "https://via.placeholder.com/150",
  };

  console.log("Rendering Account with user data:", userData);

  return (
    <Layout>
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={{
            uri:
              userData.profilePic?.url ||
              userData.profilePic ||
              "https://via.placeholder.com/150",
          }}
        />
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.name}>
            Hi <Text style={{ color: "green" }}>{userData.name}</Text>
          </Text>
          <Text>Email: {userData.email}</Text>
          <Text>Contact: {userData.phone}</Text>
          {userData.address && <Text>Address: {userData.address}</Text>}
          {userData.city && <Text>City: {userData.city}</Text>}
        </View>

        <View style={styles.btnContainer}>
          <Text style={styles.heading}>Account Setting</Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("profile", { id: userData._id })}
          >
            <AntDesign style={styles.btnText} name="edit" />
            <Text style={styles.btnText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() =>
              navigation.navigate("myorders", { id: userData._id })
            }
          >
            <AntDesign style={styles.btnText} name="bars" />
            <Text style={styles.btnText}>My orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("notifications")}
          >
            <AntDesign style={styles.btnText} name="bells" />
            <Text style={styles.btnText}>Notification</Text>
          </TouchableOpacity>

          {/* Show admin panel only if user is admin */}
          {userData.role === "admin" && (
            <TouchableOpacity
              style={styles.btn}
              onPress={() =>
                navigation.navigate("adminPanel", { id: userData._id })
              }
            >
              <AntDesign style={styles.btnText} name="windows" />
              <Text style={styles.btnText}>Admin panel</Text>
            </TouchableOpacity>
          )}

          {/* Refresh button */}
          <TouchableOpacity
            style={[
              styles.btn,
              {
                borderTopWidth: 1,
                borderTopColor: "lightgray",
                marginTop: 10,
                paddingTop: 15,
              },
            ]}
            onPress={() => dispatch(getUserData())}
          >
            <AntDesign style={styles.btnText} name="reload1" />
            <Text style={styles.btnText}>Refresh Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  image: {
    height: 100,
    width: "100%",
    resizeMode: "contain",
  },
  name: {
    marginTop: 10,
    fontSize: 20,
  },
  btnContainer: {
    padding: 10,
    backgroundColor: "#ffffff",
    margin: 10,
    marginVertical: 20,
    elevation: 5,
    borderRadius: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 10,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    padding: 5,
  },
  btnText: {
    fontSize: 15,
    marginRight: 10,
  },
});

export default Account;
