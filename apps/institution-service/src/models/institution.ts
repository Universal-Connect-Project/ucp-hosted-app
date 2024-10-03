import { UUID } from "crypto";
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
import { Aggregator } from "./aggregator";
import { AggregatorIntegration } from "./aggregatorIntegration";

export class Institution extends Model<
  InferAttributes<Institution, { omit: "aggregatorIntegrations" }>,
  InferCreationAttributes<Institution, { omit: "aggregatorIntegrations" }>
> {
  declare id?: UUID;
  declare name: string;
  declare keywords: string[];
  declare logo: string;
  declare url: string;
  declare is_test_bank: boolean;
  declare routing_numbers: string[] | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getAggregatorIntegrations: HasManyGetAssociationsMixin<AggregatorIntegration>;
  declare getAggregators: HasManyGetAssociationsMixin<Aggregator>;

  declare aggregatorIntegrations?: NonAttribute<AggregatorIntegration[]>;
  declare aggregators?: NonAttribute<Aggregator[]>;

  declare static associations: {
    aggregatorIntegrations: Association<Institution, AggregatorIntegration>;
    aggregators: Association<Institution, Aggregator>;
  };
}

Institution.init(
  {
    id: {
      type: DataTypes.UUID,
      unique: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    keywords: DataTypes.ARRAY(DataTypes.TEXT),
    logo: DataTypes.TEXT,
    url: DataTypes.TEXT,
    is_test_bank: DataTypes.BOOLEAN,
    routing_numbers: DataTypes.ARRAY(DataTypes.TEXT),
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "institutions",
    modelName: "Institution",
    sequelize,
  },
);
