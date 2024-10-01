// craco.config.js
module.exports = {
    webpack: {
      configure: {
        resolve: {
          fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("crypto-browserify"),
            // You can add more fallbacks here as needed
          },
        },
      },
    },
  };
  
  