const path = require("path");

module.exports = {
  getCacheKey() {
    return "svg-transform";
  },
  process(src) {
    return { code: `module.exports = ${JSON.stringify(path.basename(src))}` };
  },
};
