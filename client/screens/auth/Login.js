import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import InputBox from "../../components/Form/inputBox";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginImage =
    "https://www.certifiedfinancialguardian.com/images/blog-wp-login.png";

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter email or password");
    }
    alert("Login successfully");
    navigation.navigate("home");
  };
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={{ uri: loginImage }} />
      <InputBox
        placeholder={"Enter your email"}
        autoComplete={"email"}
        value={email}
        setValue={setEmail}
      />
      <InputBox
        value={password}
        setValue={setPassword}
        placeholder={"Enter your password"}
        secureTextEntry={true}
      />
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
        <Text>
          Not a user yet?{" "}
          <Text
            onPress={() => navigation.navigate("register")}
            style={styles.link}
          >
            Register
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    // alignItems: "center",
    height: "100%",
  },
  image: {
    height: 200,
    width: "100%",
  },
  btnContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loginBtn: {
    backgroundColor: "#000000",
    width: "80%",
    justifyContent: "center",
    height: 40,

    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  loginBtnText: {
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: 500,
    fontSize: 18,
  },
  link: {
    color: "red",
  },
});
export default Login;
