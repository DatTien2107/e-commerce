import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import { Provider } from "react-redux";
import store from "./redux/store";
import OrderDetails from "./screens/Orders/OrderDetails";

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="login">
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
    </Provider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
