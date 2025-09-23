module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Disable reanimated plugin
          reanimated: false,
        },
      ],
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
          },
        },
      ],
    ],
  };
};
