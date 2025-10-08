import db from "./src/database";
import { defineAssociations } from "./src/models/associations";
import { server } from "./src/test/testServer";
import * as config from "./src/shared/environment";
import { fakeEnvironment } from "./src/test/testData/environment";

beforeAll(async () => {
  defineAssociations();
  server.listen();
});

afterAll(async () => {
  await db.close();
  server.close();
});

beforeEach(() => {
  jest.spyOn(config, "getConfig").mockReturnValue(fakeEnvironment);
});

afterEach(() => server.resetHandlers());
