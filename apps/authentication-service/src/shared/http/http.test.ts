import { HttpService } from "@/shared/http/httpService";

describe("Auth test", () => {
  it("tests Auth0 token request", () => {
    const Http = HttpService.getInstance();
    expect(Http).not.toBeNull();
    Http.unregisterInterceptor();
  });
});
