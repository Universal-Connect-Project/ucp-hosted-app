import { clearRedisMock } from "./src/__mocks__/redis";
import { server } from "./src/shared/tests/testServer";

afterEach(async () => {
  clearRedisMock();
  server.resetHandlers();
});

beforeAll(() => server.listen());
afterAll(() => server.close());
