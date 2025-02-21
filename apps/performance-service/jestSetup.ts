import { clearRedisMock } from "./src/__mocks__/redis";

afterEach(async () => {
  clearRedisMock();
});
