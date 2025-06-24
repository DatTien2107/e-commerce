import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react"; // ✅ THÊM
import { Provider, useDispatch, useSelector } from "react-redux"; // ✅ THÊM useDispatch, useSelector
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ THÊM

// Existing imports - GIỮ NGUYÊN
import Home from "./screens/Home";
import About from "./screens/About";
import ProductDetails from "./screens/ProductDetails";
import Cart from "./screens/Cart";
import Checkout from "./screens/Checkout";
import Payment from "./screens/Payment";
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";
import Account from "./screens/Account/Account";
import Notification from "./screens/Account/Notification";
import Profile from "./screens/Account/Profile";
import MyOrder from "./screens/Account/MyOrder";
import Dashboard from "./screens/Admin/Dashboard";
import store from "./redux/store";
import OrderDetails from "./screens/Orders/OrderDetails";
import ManageOrders from "./screens/Admin/ManageOrders";

// ✅ THÊM import actions
import { getUserData, clearAuthState } from "./redux/features-auth/userActions";
import ManageProducts from "./screens/Admin/ManageProducts";
import CreateProduct from "./screens/Admin/CreateProduct";
import EditProduct from "./screens/Admin/EditProduct";

const Stack = createNativeStackNavigator();

// ✅ THÊM: App Content Component với initialization
function AppContent() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState("login");
  const dispatch = useDispatch();
  const { isAuth, user } = useSelector((state) => state.user);

  // ✅ THÊM: App initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing app...");

        const token = await AsyncStorage.getItem("@auth");
        console.log("🔑 Token found:", token ? "YES" : "NO");

        if (token) {
          console.log("📡 Verifying token with server...");
          try {
            await dispatch(getUserData());
            console.log("✅ Token valid, user authenticated");
            setInitialRoute("home");
          } catch (error) {
            console.log("❌ Token invalid, clearing auth state");
            await AsyncStorage.removeItem("@auth");
            dispatch(clearAuthState());
            setInitialRoute("login");
          }
        } else {
          console.log("ℹ️ No token, showing login");
          setInitialRoute("login");
        }
      } catch (error) {
        console.log("❌ App initialization error:", error);
        setInitialRoute("login");
      } finally {
        setIsAppReady(true);
        console.log("✅ App ready!");
      }
    };

    initializeApp();
  }, [dispatch]);

  // ✅ THÊM: Loading screen
  if (!isAppReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // ✅ GIỮ NGUYÊN: Navigation structure của bạn
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="about" component={About} />
        <Stack.Screen name="cart" component={Cart} />
        <Stack.Screen name="productDetails" component={ProductDetails} />
        <Stack.Screen name="checkout" component={Checkout} />
        <Stack.Screen name="payment" component={Payment} />
        <Stack.Screen name="account" component={Account} />
        <Stack.Screen name="notifications" component={Notification} />
        <Stack.Screen name="profile" component={Profile} />
        <Stack.Screen name="myorders" component={MyOrder} />
        <Stack.Screen name="adminPanel" component={Dashboard} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} />
        <Stack.Screen name="ManageOrders" component={ManageOrders} />
        <Stack.Screen name="ManageProducts" component={ManageProducts} />
        <Stack.Screen name="createProduct" component={CreateProduct} />
        <Stack.Screen name="editProduct" component={EditProduct} />

        <Stack.Screen
          name="login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="register"
          component={Register}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ✅ CHÍNH: Root App với Provider
export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <AppContent />
    </Provider>
  );
}

// ✅ THÊM: Styles cho loading screen
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});
