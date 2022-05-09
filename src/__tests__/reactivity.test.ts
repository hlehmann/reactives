import {
  createWatcher,
  getSource,
  REACTIVE_RAW_KEY,
  REACTIVE_SOURCE_KEY,
  REACTIVE_WATCH_KEY,
} from "../reactivity";

describe("Reactive Core", () => {
  describe("getSource", () => {
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

  describe("createWatcher", () => {
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
        // @ts-expect-error - we're testing the readonly behavior
        watcher.name = "Charles";
      }).toThrow();
      expect(() => {
        // @ts-expect-error - we're testing the readonly behavior
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
  });
});
