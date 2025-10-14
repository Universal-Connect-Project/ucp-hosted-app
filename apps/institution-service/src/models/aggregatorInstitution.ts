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

export class AggregatorInstitution extends Model<
  InferAttributes<AggregatorInstitution>,
  InferCreationAttributes<AggregatorInstitution>
> {
  declare id: number;
  declare supportsOAuth: boolean;
  declare supportsAccountOwner: boolean;
  declare supportsAccountNumber: boolean;
  declare supportsTransactions: boolean;
  declare supportsTransactionHistory: boolean;
  declare supportsRewards: boolean;
  declare supportsBalance: boolean;

  declare aggregatorId: ForeignKey<Aggregator["id"]>;

  declare aggregator?: NonAttribute<Aggregator>;
  declare getAggregator: BelongsToGetAssociationMixin<Aggregator>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare static associations: {
    aggregator: Association<AggregatorInstitution, Aggregator>;
  };
}

AggregatorInstitution.init(
  {
    id: {
      primaryKey: true,
      type: DataTypes.STRING,
    },
    aggregatorId: {
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    createdAt: { type: DataTypes.DATE, defaultValue: new Date() },
    supportsAccountOwner: { type: DataTypes.BOOLEAN, defaultValue: false },
    supportsAccountNumber: { type: DataTypes.BOOLEAN, defaultValue: false },
    supportsBalance: { type: DataTypes.BOOLEAN, defaultValue: false },
    supportsOAuth: { type: DataTypes.BOOLEAN, defaultValue: false },
    supportsRewards: { type: DataTypes.BOOLEAN, defaultValue: false },
    supportsTransactions: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    supportsTransactionHistory: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    updatedAt: { type: DataTypes.DATE, defaultValue: new Date() },
  },
  {
    tableName: "aggregatorInstitutions",
    modelName: "AggregatorInstitution",
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ["aggregatorId"],
      },
    ],
  },
);
