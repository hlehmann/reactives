import { act, fireEvent, render, screen } from "@testing-library/react";

import { createRef } from "../../core/ref";
import { getSource } from "../../core/source";
import { RefsStoreProvider } from "../ref";
import { useReactiveState, useWatcher } from "../watcher";

describe("useWatcher", () => {
  it("should rerender on data change", () => {
    const raw = { name: "John", age: 20 };
    const source = getSource(raw);
    let renders = 0;

    function Component() {
      const r = useWatcher(source);
      renders += 1;
      return <div>{r.name}</div>;
    }

    expect(renders).toBe(0);
    render(<Component />);
    expect(renders).toBe(1);
    act(() => {
      source.name = "Jane";
    });
    expect(renders).toBe(2);
    act(() => {
      source.name = "Tom";
    });
    expect(renders).toBe(3);
  });

  it("should access refs", () => {
    const ref = createRef(() => getSource({ name: "John", age: 20 }));
    function Component1() {
      const r = useWatcher(ref);
      return <div role="main">{r.name}</div>;
    }
    function Component2() {
      const r = useWatcher(ref);
      return (
        <button
          type="button"
          onClick={() => {
            r.$source.name = "Jane";
          }}
        >
          Change name
        </button>
      );
    }
    function App() {
      return (
        <RefsStoreProvider>
          <Component1 />
          <Component2 />
        </RefsStoreProvider>
      );
    }
    render(<App />);
    expect(screen.getByRole("main")).toHaveTextContent("John");
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("main")).toHaveTextContent("Jane");
  });
});

describe("useReactiveState", () => {
  it("should provide a reactive state", () => {
    function Component() {
      const r = useReactiveState({ name: "John", age: 20 });
      return (
        <button
          type="button"
          onClick={() => {
            r.$source.name = "Jane";
          }}
        >
          {r.name}
        </button>
      );
    }
    render(<Component />);
    expect(screen.getByRole("button")).toHaveTextContent("John");
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("Jane");
  });
});
