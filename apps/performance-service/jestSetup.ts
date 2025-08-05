import { clearRedisMock } from "./src/__mocks__/redis";
import { server } from "./src/shared/tests/testServer";
import { clearInfluxData } from "./src/shared/tests/utils";

afterEach(async () => {
  clearRedisMock();
  server.resetHandlers();
});

beforeAll(async () => {
  await clearInfluxData();

  server.listen();
});
afterAll(() => server.close());
