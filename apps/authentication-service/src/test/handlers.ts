import { http, HttpRequestHandler, HttpResponse } from "msw";

interface Ping404Response {
  status: number;
}

export const handlers = [
  http.get("http://localhost:8081/api/pig", () =>
    HttpResponse.json<Ping404Response>({ status: 404 }),
  ),
  http.get("http://localhost:8081/api/error", () => {
    throw new Error("error");
  }),
];
