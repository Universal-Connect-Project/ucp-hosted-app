require("@testing-library/jest-dom/jest-globals");
require("whatwg-fetch");

const server = require("./src/shared/test/testServer").server;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

Element.prototype.scrollTo = jest.fn();
