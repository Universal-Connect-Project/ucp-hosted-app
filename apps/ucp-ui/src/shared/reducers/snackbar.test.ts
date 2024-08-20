import { createStore } from "../../store";
import {
  closeSnackbar,
  displaySnackbar,
  getIsSnackbarOpen,
  getSnackbarMessage,
} from "./snackbar";

describe("snackbar reducer", () => {
  describe("displaySnackbar and closeSnackbar", () => {
    it("sets the message and opens it on display snackbar, closes it with closeSnackbar", () => {
      const store = createStore();

      const message = "testSnackbar";

      store.dispatch(displaySnackbar(message));

      expect(getIsSnackbarOpen(store.getState())).toBe(true);
      expect(getSnackbarMessage(store.getState())).toBe(message);

      store.dispatch(closeSnackbar());

      expect(getIsSnackbarOpen(store.getState())).toBe(false);
    });
  });
});
