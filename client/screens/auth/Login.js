import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect } from "react";
import InputBox from "../../components/Form/inputBox";

//redux hooks
import { login } from "../../redux/features-auth/userActions";
import { useDispatch, useSelector } from "react-redux";

const Login = ({ navigation }) => {
  const loginImage = "https://fishcopfed.coop/images/login.png";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // hooks
  const dispatch = useDispatch();

  // ✅ FIX: Use useSelector directly instead of customeHook
  const { loading, error, message } = useSelector((state) => state.user);

  // ✅ FIX: Handle login-specific messages only
  useEffect(() => {
    if (error) {
      alert(error);
      dispatch({ type: "clearError" });
    }

    if (message) {
      alert(message);
      dispatch({ type: "clearMessage" });

      // ✅ CRITICAL FIX: Only navigate on successful login
      if (message.includes("Login Successfully")) {
        navigation.reset({
          index: 0,
          routes: [{ name: "home" }],
        });
      }
      // For other messages (like profile updates), just show alert but don't navigate
    }
  }, [error, message, dispatch, navigation]);

  // login function
  const handleLogin = () => {
    if (!email || !password) {
      return alert("Please add email or password");
    }
    dispatch(login(email, password));
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: loginImage }} style={styles.image} />
      {loading && <Text>loading ...</Text>}
      <InputBox
        placeholder={"Enter You Email"}
        value={email}
        setValue={setEmail}
        autoComplete={"email"}
      />
      <InputBox
        value={password}
        setValue={setPassword}
        placeholder={"Enter You Password"}
        secureTextEntry={true}
      />
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
        <Text>
          Not a user yet ? Please{"  "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("register")}
          >
            Register !
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  image: {
    height: 200,
    width: "100%",
    resizeMode: "contain",
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
    marginVertical: 20,
  },
  loginBtnText: {
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "500",
    fontSize: 18,
  },
  link: {
    color: "red",
  },
});

export default Login;
