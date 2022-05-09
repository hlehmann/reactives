import { getSource, REACTIVE_RAW_KEY, REACTIVE_WATCH_KEY } from "../source";

describe("Source", () => {
  it("should have the same shape as the raw", () => {
    const raw = { name: "John", age: 20 };
    const source = getSource(raw);
    expect(source).not.toBe(raw);
    expect(source).toEqual(raw);
    expect(source.name).toBe("John");
  });

  it("should return raw", () => {
    const raw = { name: "John", age: 20 };
    const source = getSource(raw);
    expect(source[REACTIVE_RAW_KEY]).toBe(raw);
  });

  it("should update the raw object on property change", () => {
    const raw = { name: "John", age: 20 };
    const source = getSource(raw);
    source.name = "Jane";
    expect(raw.name).toBe("Jane");
  });

  it("should be watchable", () => {
    const source = getSource({ name: "John", age: 20 });
    const listener = jest.fn();
    source[REACTIVE_WATCH_KEY]("name", listener);
    expect(listener).toHaveBeenCalledTimes(0);
    source.name = "Jane";
    expect(listener).toHaveBeenCalledTimes(1);
    source.name = "Jane";
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should not trigger on unchanged value", () => {
    const source = getSource({ name: "John", age: 20 });
    const listener = jest.fn();
    source[REACTIVE_WATCH_KEY]("name", listener);
    source.name = "John";
    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("should have object children as sources", () => {
    const source = getSource({ name: "John", child: { name: "Jane" } });
    expect(source.name).toBe("John");
    const listener = jest.fn();
    source.child[REACTIVE_WATCH_KEY]("name", listener);
    source.child.name = "Jack";
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
