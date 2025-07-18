const { TextDecoder, TextEncoder } = require("node:util");
const { ReadableStream, TransformStream } = require("node:stream/web");

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  TransformStream: { value: TransformStream },
});

const { Blob, File } = require("node:buffer");
const { fetch, Headers, FormData, Request, Response } = require("undici");

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  Blob: { value: Blob },
  File: { value: File },
  Headers: { value: Headers },
  FormData: { value: FormData },
  Request: { value: Request },
  Response: { value: Response },
});

const { randomUUID } = require("node:crypto");

Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID,
  },
});

Object.defineProperty(globalThis, "scrollTo", {
  value: () => {},
});

window.HTMLElement.prototype.scrollIntoView = function () {};

Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: async () => {},
  },
});

process.env.WIDGET_DEMO_BASE_URL = "http://localhost:1234";
