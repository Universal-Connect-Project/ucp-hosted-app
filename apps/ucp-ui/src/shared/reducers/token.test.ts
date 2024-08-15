import { createStore } from "../../store";
import { getAccessToken, setAccessToken } from "./token";

describe("token reducer", () => {
  describe("setAccessToken and getAccessToken", () => {
    it("sets and gets the access token", () => {
      const store = createStore();

      expect(getAccessToken(store.getState())).toBeUndefined();

      const token = "testToken";

      store.dispatch(setAccessToken(token));

      expect(getAccessToken(store.getState())).toEqual(token);
    });
  });
});
