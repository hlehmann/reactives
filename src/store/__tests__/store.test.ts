import { createWatcher } from "../../core/watcher";
import { createStore, MUTATIONS_KEY } from "../store";

function initStore() {
  return createStore(
    { name: "John", child: { name: "Jane" } },
    {
      setName: (state, name: string) => {
        state.name = name;
      },
    }
  );
}

describe("Store", () => {
  it("should be watchable", () => {
    const store = initStore();
    const listener = jest.fn();
    const watcher = createWatcher(store, listener);
    expect(listener).toHaveBeenCalledTimes(0);
    expect(watcher.name).toBe("John");
    store[MUTATIONS_KEY].setName("Jane");
    expect(listener).toHaveBeenCalledTimes(1);
    store[MUTATIONS_KEY].setName("Jane");
    expect(watcher.name).toBe("Jane");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should be readonly", () => {
    const store = initStore();
    expect(() => {
      // @ts-expect-error - we're testing the readonly behavior
      store.name = "Charles";
    }).toThrow();
    expect(() => {
      // @ts-expect-error - we're testing the readonly behavior
      store.child.name = "Charles";
    }).toThrow();
  });
});
