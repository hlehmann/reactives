/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src/"],
  globals: {
    "ts-jest": {},
  },
  setupFilesAfterEnv: ["./jest-setup.js"],
};
export default config;
