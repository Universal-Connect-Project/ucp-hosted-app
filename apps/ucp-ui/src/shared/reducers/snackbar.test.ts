import { createStore } from "../../store";
import { displaySnackbar, getSnackbarSlice } from "./snackbar";

describe("snackbar reducer", () => {
  describe("setAccessSnackbar and getAccessSnackbar", () => {
    it("sets and gets the snackbar, and updates the id every time display is called", () => {
      const store = createStore();

      const snackbar = "testSnackbar";

      store.dispatch(displaySnackbar(snackbar));

      const slice = getSnackbarSlice(store.getState());

      const firstMessageId = slice.messageId;

      expect(slice.message).toEqual(snackbar);
      expect(firstMessageId).toBeDefined();

      store.dispatch(displaySnackbar(snackbar));

      expect(getSnackbarSlice(store.getState()).messageId).not.toEqual(
        firstMessageId,
      );
    });
  });
});
