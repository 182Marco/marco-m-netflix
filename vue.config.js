module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/vue-boolflix/" : "/",
  devServer: {
    host: "0.0.0.0",
    allowedHosts: ["all"],
    disableHostCheck: true,
  },
};
