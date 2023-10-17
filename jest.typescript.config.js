const { jsWithTs } = require("ts-jest/presets");
const baseConfig = require("./jest.config");

const baseTsConfig = {
  ...baseConfig,
  ...jsWithTs,
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?": ["ts-jest", { isolatedModules: true }],
  },
  testEnvironment: "jsdom",
};

const generateConfig = ({ collectCoverageFrom = [], moduleNameMapper = {}, rootDir = ".", tsconfig = {} }) => ({
  ...baseTsConfig,
  collectCoverageFrom: [...baseTsConfig.collectCoverageFrom, ...collectCoverageFrom],
  moduleNameMapper: {
    ...baseTsConfig.moduleNameMapper,
    ...moduleNameMapper,
  },
  rootDir,
  transform: {
    "^.+\\.(ts|tsx)?": ["ts-jest", { isolatedModules: true, tsconfig }],
  },
});

module.exports = {
  baseTsConfig,
  generateConfig,
};
