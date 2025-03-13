module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/marco-m-netflix/" : "/",
  devServer: {
    host: "0.0.0.0",
    allowedHosts: ["all"],
    disableHostCheck: true,
  },
};
