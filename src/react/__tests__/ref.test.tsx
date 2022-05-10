import { render } from "@testing-library/react";

import { RefsStore } from "../../ref";
import { RefsStoreProvider, useRefsStore } from "../ref";

describe("RefsStoreProvider", () => {
  it("should provider a ref store", () => {
    let refsStore: RefsStore | undefined;
    function App() {
      return (
        <RefsStoreProvider>
          <Component />
        </RefsStoreProvider>
      );
    }

    function Component() {
      refsStore = useRefsStore();
      return null;
    }

    render(<App />);
    expect(refsStore).toBeDefined();
  });
});
