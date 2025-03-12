import {
  Association,
  BelongsToGetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";
import sequelize from "../database";
import { Aggregator } from "./aggregator";
import { Institution } from "./institution";

export class AggregatorIntegration extends Model<
  InferAttributes<AggregatorIntegration>,
  InferCreationAttributes<AggregatorIntegration>
> {
  declare id: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare aggregator_institution_id: string;
  declare supports_oauth: CreationOptional<boolean>;
  declare supports_identification: CreationOptional<boolean>;
  declare supports_verification: CreationOptional<boolean>;
  declare supports_aggregation: CreationOptional<boolean>;
  declare supports_history: CreationOptional<boolean>;
  declare supportsRewards: CreationOptional<boolean>;
  declare supportsBalance: CreationOptional<boolean>;
  declare institution_id: ForeignKey<Institution["id"]>;
  declare aggregatorId: ForeignKey<Aggregator["id"]>;

  declare institution?: NonAttribute<Institution>;
  declare aggregator?: NonAttribute<Aggregator>;
  declare getAggregator: BelongsToGetAssociationMixin<Aggregator>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare static associations: {
    aggregator: Association<AggregatorIntegration, Aggregator>;
  };
}

AggregatorIntegration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    aggregator_institution_id: {
      type: DataTypes.STRING,
    },
    aggregatorId: {
      type: DataTypes.INTEGER,
    },
    supports_oauth: { type: DataTypes.BOOLEAN, defaultValue: false },
    supports_identification: { type: DataTypes.BOOLEAN, defaultValue: false },
    supports_verification: { type: DataTypes.BOOLEAN, defaultValue: false },
    supports_aggregation: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    supports_history: { type: DataTypes.BOOLEAN, defaultValue: false },
    supportsRewards: { type: DataTypes.BOOLEAN, defaultValue: false },
    supportsBalance: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, defaultValue: new Date() },
    updatedAt: { type: DataTypes.DATE, defaultValue: new Date() },
  },
  {
    tableName: "aggregatorIntegrations",
    modelName: "AggregatorIntegration",
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ["institution_id", "aggregatorId"],
      },
    ],
  },
);
