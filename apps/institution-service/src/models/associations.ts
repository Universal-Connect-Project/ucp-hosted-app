import { Aggregator } from "./aggregator";
import { AggregatorIntegration } from "./aggregatorIntegration";
import { Institution } from "./institution";
import { WidgetPreferences } from "./widgetPreferences";

export const defineAssociations = () => {
  Institution.hasMany(AggregatorIntegration, {
    sourceKey: "id",
    foreignKey: "institution_id",
    as: "aggregatorIntegrations",
  });

  Aggregator.hasMany(AggregatorIntegration, {
    sourceKey: "id",
    foreignKey: "aggregatorId",
    as: "aggregatorIntegrations",
  });

  Aggregator.belongsToMany(Institution, {
    through: "AggregatorIntegration",
    sourceKey: "id",
    foreignKey: "aggregatorId",
    as: "aggregators",
  });

  Institution.belongsToMany(Aggregator, {
    through: "AggregatorIntegration",
    sourceKey: "id",
    foreignKey: "institution_id",
  });

  AggregatorIntegration.belongsTo(Institution, {
    foreignKey: "institution_id",
    as: "institution",
  });

  AggregatorIntegration.belongsTo(Aggregator, {
    foreignKey: "aggregatorId",
    as: "aggregator",
  });

  WidgetPreferences.hasOne(Aggregator, {
    foreignKey: "id",
    sourceKey: "defaultAggregatorId",
    as: "defaultAggregator",
  });
};
