import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./src/test/testServer";

beforeAll(async () => {
  server.listen();
});

afterAll(async () => {
  server.close();
});

afterEach(() => server.resetHandlers());
