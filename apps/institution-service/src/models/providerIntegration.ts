import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";
import sequelize from "../database";
import { Institution } from "./institution";
import { Provider } from "./provider";

export class ProviderIntegration extends Model<
  InferAttributes<ProviderIntegration>,
  InferCreationAttributes<ProviderIntegration>
> {
  declare id: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare provider_institution_id: string;
  declare supports_oauth: CreationOptional<boolean>;
  declare supports_identification: CreationOptional<boolean>;
  declare supports_verification: CreationOptional<boolean>;
  declare supports_aggregation: CreationOptional<boolean>;
  declare supports_history: CreationOptional<boolean>;
  declare institution_id: ForeignKey<Institution["ucp_id"]>;
  declare providerId: ForeignKey<Provider["id"]>;

  declare institution?: NonAttribute<Institution>;
  declare provider?: NonAttribute<Provider>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare static associations: {
    provider: Association<ProviderIntegration, Provider>;
  };
}

ProviderIntegration.init(
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
    provider_institution_id: {
      type: DataTypes.STRING,
    },
    providerId: {
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
    createdAt: { type: DataTypes.DATE, defaultValue: new Date() },
    updatedAt: { type: DataTypes.DATE, defaultValue: new Date() },
  },
  {
    tableName: "providerIntegrations",
    modelName: "ProviderIntegration",
    sequelize,
  },
);
