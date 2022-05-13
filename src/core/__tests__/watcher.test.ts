import { createRef, RefsStore } from "../ref";
import { getSource, REACTIVE_RAW_KEY, REACTIVE_WATCH_KEY } from "../source";
import { createWatcher, REACTIVE_SOURCE_KEY } from "../watcher";

describe("Watcher", () => {
  it("should have the same shape that the source", () => {
    const source = getSource({ name: "John", age: 20 });
    const watcher = createWatcher(source, jest.fn());
    expect(watcher).not.toBe(source);
    expect(watcher).toEqual(source);
    expect(watcher[REACTIVE_SOURCE_KEY]).toBe(source);
    expect(watcher.name).toBe("John");
  });

  it("should be readonly", () => {
    const source = getSource({ name: "John", child: { name: "Jane" } });
    const watcher = createWatcher(source, jest.fn());
    expect(() => {
      // @ts-expect-error - we're testing a readonly behavior
      watcher.name = "Charles";
    }).toThrow();
    expect(() => {
      // @ts-expect-error - we're testing a readonly behavior
      watcher.child.name = "Charles";
    }).toThrow();
  });

  it("should watch read property", () => {
    const source = {
      name: "John",
      [REACTIVE_WATCH_KEY]: jest.fn(),
      [REACTIVE_RAW_KEY]: { name: "John" },
    };
    const listener = jest.fn();
    const watcher = createWatcher(source, listener);
    expect(watcher.name).toBe("John");
    expect(source[REACTIVE_WATCH_KEY]).toHaveBeenCalledTimes(1);
  });

  it("should trigger on read property change", () => {
    const source = getSource({ name: "John", age: 20 });
    const listener = jest.fn();
    const watcher = createWatcher(source, listener);
    expect(watcher.name).toBe("John");
    expect(listener).toHaveBeenCalledTimes(0);
    source.name = "Jane";
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should not trigger on unread property change", () => {
    const source = getSource({ name: "John", age: 20 });
    const listener = jest.fn();
    const watcher = createWatcher(source, listener);
    expect(watcher.name).toBe("John");
    expect(listener).toHaveBeenCalledTimes(0);
    source.age = 30;
    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("should trigger on read sub property change", () => {
    const source = getSource({ child: { name: "Jane", age: 10 } });
    const listener = jest.fn();
    const watcher = createWatcher(source, listener);
    expect(watcher.child.name).toBe("Jane");
    expect(listener).toHaveBeenCalledTimes(0);
    source.child.name = "John";
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should not trigger on unread sub property change", () => {
    const source = getSource({ child: { name: "Jane", age: 10 } });
    const listener = jest.fn();
    const watcher = createWatcher(source, listener);
    expect(watcher.child.name).toBe("Jane");
    expect(listener).toHaveBeenCalledTimes(0);
    source.child.age = 5;
    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("should access refs", () => {
    const source = getSource({ name: "John" });
    const ref = createRef(() => source);
    const refStore = new RefsStore();
    const listener = jest.fn();
    expect(() => createWatcher(ref, listener)).toThrow();
    const watcher = createWatcher(ref, listener, refStore);
    expect(watcher.name).toBe("John");
    source.name = "Jane";
    expect(listener).toHaveBeenCalledTimes(1);
    expect(watcher.name).toBe("Jane");
  });
});
