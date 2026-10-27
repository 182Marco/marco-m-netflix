const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        // testi in 5 lingue, fuori da src
        '@locales': path.resolve(__dirname, 'locales'),
      },
    },
    module: {
      rules: [
        // Your custom rules
      ],
    },
    plugins: [
      // Your custom plugins
    ],
  },
};
