module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        "webpack/lib/RuleSet": require.resolve("webpack/lib/RuleSet"),
      },
    },
  },
};
