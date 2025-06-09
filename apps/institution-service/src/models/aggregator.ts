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

export class Aggregator extends Model<
  InferAttributes<Aggregator, { omit: "aggregatorIntegrations" }>,
  InferCreationAttributes<Aggregator, { omit: "aggregatorIntegrations" }>
> {
  declare id: CreationOptional<number>;
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
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
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
