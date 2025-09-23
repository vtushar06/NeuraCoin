const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure the config works for web
config.resolver.platforms = ["native", "web", "ios", "android"];

config.resolver.alias = {
  "react-native$": "react-native-web",
};

module.exports = config;
