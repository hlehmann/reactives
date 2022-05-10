import { createRef, RefsStore } from "../ref";
import { getSource } from "../source";

describe("ref", () => {
  it("should call builder at first use", () => {
    const source = getSource({ name: "John" });
    const builder = jest.fn(() => source);
    const ref = createRef(builder);
    const refStore = new RefsStore();
    expect(builder).toHaveBeenCalledTimes(0);
    const source1 = refStore.get(ref);
    expect(builder).toHaveBeenCalledTimes(1);
    expect(source1).toBe(source);
  });

  it("shoud call build only once by store", () => {
    const builder = jest.fn(() => getSource({ name: "John" }));
    const ref = createRef(builder);
    const refStore = new RefsStore();
    const source1 = refStore.get(ref);
    const source2 = refStore.get(ref);
    expect(builder).toHaveBeenCalledTimes(1);
    expect(source1).toBe(source2);
    const refStore2 = new RefsStore();
    const source3 = refStore2.get(ref);
    expect(builder).toHaveBeenCalledTimes(2);
    expect(source3).not.toBe(source2);
  });
});
