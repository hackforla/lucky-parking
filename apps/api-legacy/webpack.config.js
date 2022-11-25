const nrwlConfig = require("@nrwl/react/plugins/webpack.js");

module.exports = (config, context) => {
  nrwlConfig(config);

  if (process.env.NODE_ENV === "development") {
    config.watchOptions = {
      aggregateTimeout: 500,
      poll: 1000,
    }

    config.devServer = {
      ...config.devServer,
      client: {
        webSocketURL: "auto://0.0.0.0:0/ws",
      },
    };
  }

  return config;
};
