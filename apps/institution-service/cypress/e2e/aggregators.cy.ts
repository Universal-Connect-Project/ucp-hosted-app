import { runTokenInvalidCheck } from "../support/utils";
import {
  expectLooksLikeAggregators,
  getAggregators,
} from "../shared/utils/aggregator";

describe("aggregators", () => {
  describe("/aggregators GET", () => {
    it("returns a list of aggregators for a valid token", () => {
      getAggregators().then(expectLooksLikeAggregators);
    });

    runTokenInvalidCheck({
      url: "aggregators",
      method: "GET",
    });
  });
});
