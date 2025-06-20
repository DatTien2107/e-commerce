import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import InputBox from "../../components/Form/inputBox";

const Register = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");

  const loginImage =
    "https://www.certifiedfinancialguardian.com/images/blog-wp-login.png";

  const handleRegister = () => {
    if (!email || !password || !name || !address || !city || !contact) {
      alert("Please provide all field");
    }
    alert("Register successfully");
    navigation.navigate("login");
  };
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={{ uri: loginImage }} />
      <InputBox
        placeholder={"Enter your name"}
        autoComplete={"name"}
        value={name}
        setValue={setName}
      />
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
      <InputBox
        value={address}
        setValue={setAddress}
        placeholder={"Enter your address"}
        autoComplete={"address-line1"}
      />
      <InputBox
        value={city}
        setValue={setCity}
        placeholder={"Enter your city"}
        autoComplete={"country"}
      />
      <InputBox
        value={contact}
        setValue={setContact}
        placeholder={"Enter your contact number"}
        autoComplete={"tel"}
      />
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.loginBtn} onPress={handleRegister}>
          <Text style={styles.loginBtnText}>Register</Text>
        </TouchableOpacity>
        <Text>
          Already a user please?{" "}
          <Text
            onPress={() => navigation.navigate("login")}
            style={styles.link}
          >
            Login
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
export default Register;
