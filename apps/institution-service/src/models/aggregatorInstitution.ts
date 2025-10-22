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
  declare id: string;
  declare name: string;
  declare supportsOAuth?: boolean;
  declare supportsAccountOwner?: boolean;
  declare supportsAccountNumber?: boolean;
  declare supportsTransactions?: boolean;
  declare supportsTransactionHistory?: boolean;
  declare supportsRewards?: boolean;
  declare supportsBalance?: boolean;
  declare url?: string;

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
    aggregatorId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    supportsAccountOwner: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    supportsAccountNumber: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    supportsBalance: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    supportsOAuth: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    supportsRewards: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    supportsTransactions: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    supportsTransactionHistory: {
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    url: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "aggregatorInstitutions",
    modelName: "AggregatorInstitution",
    paranoid: true,
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ["aggregatorId"],
      },
    ],
  },
);
