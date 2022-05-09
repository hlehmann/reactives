import { hello } from "..";

describe("index", () => {
  test("hello", () => {
    expect(hello()).toBe("Hello World!");
  });
});
