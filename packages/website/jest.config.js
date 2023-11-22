import tsConfig from "../../jest.typescript.config.js";

const { generateConfig } = tsConfig;

const projectDir = "<rootDir>/packages/website";

const config = generateConfig({
  collectCoverageFrom: [`${projectDir}/src/**/*.{ts,tsx}`],
  moduleNameMapper: {
    "^@/(.*)$": [`${projectDir}/src/$1`],
  },
  rootDir: "../..",
  tsconfig: `${projectDir}/tsconfig.json`,
});

export default config;
