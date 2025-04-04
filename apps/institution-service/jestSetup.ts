import db from "./src/database";
import { defineAssociations } from "./src/models/associations";
import { server } from "./src/test/testServer";

beforeAll(async () => {
  defineAssociations();
  server.listen();
});

afterAll(async () => {
  await db.close();
  server.close();
});

afterEach(() => server.resetHandlers());
