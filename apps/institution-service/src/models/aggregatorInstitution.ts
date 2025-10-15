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
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    aggregatorId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    supportsAccountOwner: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    supportsAccountNumber: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    supportsBalance: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    supportsOAuth: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    supportsRewards: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    supportsTransactions: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    supportsTransactionHistory: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
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
