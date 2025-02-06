import { clearRedisMock } from "./src/__mocks__/redis";

beforeAll(() => {});

afterEach(async () => {
  clearRedisMock();
});
