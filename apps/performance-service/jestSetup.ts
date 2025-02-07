import { clearRedisMock } from "./src/__mocks__/redis";

beforeAll(() => {
  jest.useFakeTimers();
});

afterEach(async () => {
  clearRedisMock();
});
