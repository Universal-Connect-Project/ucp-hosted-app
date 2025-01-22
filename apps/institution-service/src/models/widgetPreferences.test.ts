import { mxAggregatorId } from "../test/testData/aggregators";
import { WidgetPreferences } from "./widgetPreferences";
import { v4 as uuidv4 } from "uuid";

describe("Widget Preferences model", () => {
  it("creates a widget preferences without a defaultAggregator", async () => {
    const newInstitutionAttributes = {
      id: uuidv4(),
    };
    const createdWidgetPreferences = await WidgetPreferences.create(
      newInstitutionAttributes,
    );

    expect(createdWidgetPreferences).toHaveProperty("id");
    expect(createdWidgetPreferences.defaultAggregatorId).toBe(null);

    // db cleanup
    void createdWidgetPreferences.destroy();
  });

  it("creates a widget preferences with a defaultAggregator", async () => {
    const newInstitutionAttributes = {
      id: uuidv4(),
      defaultAggregatorId: mxAggregatorId,
    };
    const createdWidgetPreferences = await WidgetPreferences.create(
      newInstitutionAttributes,
    );

    expect(createdWidgetPreferences).toHaveProperty("id");
    expect(createdWidgetPreferences.defaultAggregatorId).toBe(mxAggregatorId);

    // db cleanup
    void createdWidgetPreferences.destroy();
  });

  it("errors if you try to create a widget preferences with an invalid aggregatorId", async () => {
    await expect(() =>
      WidgetPreferences.create({
        id: uuidv4(),
        defaultAggregatorId: 123213,
      }),
    ).rejects.toThrow();
  });
});
