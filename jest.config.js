const { defaults } = require("jest-config");

const baseConfig = {
  ...defaults,
  collectCoverage: true,
  collectCoverageFrom: ["!**/node_modules/**"],
  moduleNameMapper: {
    "\\.(css|jpg|less|png|sass|scss|styl|svg|ttf|woff|woff2)$": "<rootDir>/__mocks__/file-mock.js",
  },
  roots: ["<rootDir>/packages/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\svg$": "<rootDir>/scripts/transform-svg.js",
  },
  verbose: true,
};

module.exports = baseConfig;
