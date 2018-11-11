import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";

import Tweet from "../components/Tweet";

import api from "../services/api";

import socket from "socket.io-client";

export default class Timeline extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Início",
    headerRight: (
      <TouchableOpacity onPress={() => navigation.navigate("New")}>
        <Icon
          style={{ marginRight: 20 }}
          name="add-circle-outline"
          size={24}
          color="#4BB0EE"
        />
      </TouchableOpacity>
    )
  });

  state = {
    tweets: []
  };

  async componentDidMount() {
    this.subscribeToEvents();

    const response = await api.get("/tweets");

    this.setState({ tweets: response.data });
  }

  subscribeToEvents = () => {
    console.log("Tentando se conectar...");
    const io = socket("http://10.0.3.2:3003", { transports: ["websocket"] });

    io.on("connect", () => {
      console.log("Conectado!!!");
    });

    io.on("tweet", data => {
      this.setState({ ...this.state, tweets: [data, ...this.state.tweets] });
    });

    io.on("like", data => {
      this.setState({
        ...this.state,
        tweets: this.state.tweets.map(tweet =>
          tweet._id === data._id ? data : tweet
        )
      });
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.tweets}
          keyExtractor={tweet => tweet._id}
          renderItem={({ item }) => <Tweet tweet={item} />}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  }
});
