import { exampleApiToken } from "../../test/testData/users";
import { getManagementAccessToken } from "./getManagementAccessToken";

describe("getManagementAccessToken", () => {
  it("retrieves an access token", async () => {
    const token = await getManagementAccessToken();

    expect(token).toEqual(exampleApiToken);
  });
});
