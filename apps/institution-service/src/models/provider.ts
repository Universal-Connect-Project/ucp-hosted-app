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
import { Institution } from "./institution";
import { ProviderIntegration } from "./providerIntegration";

export class Provider extends Model<
  InferAttributes<Provider, { omit: "providerIntegrations" }>,
  InferCreationAttributes<Provider, { omit: "providerIntegrations" }>
> {
  declare id?: number;
  declare name: string;
  declare displayName: string;
  declare logo: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getProviderIntegrations: HasManyGetAssociationsMixin<ProviderIntegration>;

  declare providerIntegrations?: NonAttribute<ProviderIntegration[]>;

  declare static associations: {
    providerIntegrations: Association<Provider, ProviderIntegration>;
  };
}

Provider.init(
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
    tableName: "providers",
    modelName: "Provider",
    sequelize,
  },
);

Provider.hasMany(ProviderIntegration, {
  sourceKey: "id",
  foreignKey: "providerId",
  as: "providerIntegrations",
});

Provider.belongsToMany(Institution, {
  through: "ProviderIntegration",
  sourceKey: "id",
  foreignKey: "providerId",
});

Institution.belongsToMany(Provider, {
  through: "ProviderIntegration",
  sourceKey: "ucp_id",
  foreignKey: "institution_id",
});

ProviderIntegration.belongsTo(Institution, {
  foreignKey: "institution_id",
  as: "institution",
});

ProviderIntegration.belongsTo(Provider, {
  foreignKey: "providerId",
  as: "provider",
});
