import {
  Association,
  CreationOptional,
  DataTypes,
  HasManyGetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";
import sequelize from "../database";
import { AggregatorIntegration } from "./aggregatorIntegration";
import { Institution } from "./institution";

export class Aggregator extends Model<
  InferAttributes<Aggregator, { omit: "aggregatorIntegrations" }>,
  InferCreationAttributes<Aggregator, { omit: "aggregatorIntegrations" }>
> {
  declare id?: number;
  declare name: string;
  declare displayName: string;
  declare logo: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getAggregatorIntegrations: HasManyGetAssociationsMixin<AggregatorIntegration>;

  declare aggregatorIntegrations?: NonAttribute<AggregatorIntegration[]>;

  declare static associations: {
    aggregatorIntegrations: Association<Aggregator, AggregatorIntegration>;
  };
}

Aggregator.init(
  {
    name: {
      type: DataTypes.TEXT,
    },
    displayName: DataTypes.TEXT,
    logo: DataTypes.TEXT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "aggregators",
    modelName: "Aggregator",
    sequelize,
  },
);

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
  sourceKey: "ucp_id",
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
