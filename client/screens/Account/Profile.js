import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import { userData } from "../../data/userData";
import { Image } from "react-native";
import InputBox from "../../components/Form/inputBox";

const Profile = ({ navigation }) => {
  const [email, setEmail] = useState(userData.email);
  const [profilePic, setProfilePic] = useState(userData.profilePic);
  const [password, setPassword] = useState(userData.password);
  const [name, setName] = useState(userData.name);
  const [address, setAddress] = useState(userData.address);
  const [city, setCity] = useState(userData.city);
  const [contact, setContact] = useState(userData.contact);

  const handleUpdate = () => {
    if (!email || !password || !name || !address || !city || !contact) {
      alert("Please provide all field");
    }
    alert("Update successfully");
    navigation.navigate("account");
  };
  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={{ uri: profilePic }} />
            <Pressable onPress={() => alert("profile dialogbox")}>
              <Text style={{ color: "red" }}> Update profile pic</Text>
            </Pressable>
          </View>
          <InputBox
            value={name}
            setValue={setName}
            placeholder={"Enter your name"}
            autoComplete={"name"}
          />
          <InputBox
            value={email}
            setValue={setEmail}
            placeholder={"Enter your email"}
            autoComplete={"email"}
          />
          <InputBox
            value={password}
            setValue={setPassword}
            placeholder={"Enter your new password"}
            autoComplete={"password"}
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
          <TouchableOpacity style={styles.btnUpdate} onPress={handleUpdate}>
            <Text style={styles.btnUpdateText}>Update profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Layout>
  );
};
const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 100,
    width: "100%",
    resizeMode: "contain",
  },
  btnUpdate: {
    backgroundColor: "#000000",
    height: 40,
    borderRadius: 20,
    marginHorizontal: 30,
    justifyContent: "center",
    marginTop: 10,
  },
  btnUpdateText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
  },
});
export default Profile;
