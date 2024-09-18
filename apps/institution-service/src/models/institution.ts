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
import { Provider } from "./provider";
import { ProviderIntegration } from "./providerIntegration";

export class Institution extends Model<
  InferAttributes<Institution, { omit: "providerIntegrations" }>,
  InferCreationAttributes<Institution, { omit: "providerIntegrations" }>
> {
  declare ucp_id: string;
  declare name: string;
  declare keywords: string | null;
  declare logo: string;
  declare url: string;
  declare is_test_bank: boolean;
  declare routing_numbers: string[] | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getProviderIntegrations: HasManyGetAssociationsMixin<ProviderIntegration>;

  declare providerIntegrations?: NonAttribute<ProviderIntegration[]>;
  declare Providers?: NonAttribute<Provider[]>;

  declare static associations: {
    providerIntegrations: Association<Institution, ProviderIntegration>;
    Providers: Association<Institution, Provider>;
  };
}

Institution.init(
  {
    ucp_id: {
      type: DataTypes.TEXT,
      unique: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
    },
    keywords: DataTypes.TEXT,
    logo: DataTypes.TEXT,
    url: DataTypes.TEXT,
    is_test_bank: DataTypes.BOOLEAN,
    routing_numbers: DataTypes.ARRAY(DataTypes.TEXT),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "institutions",
    modelName: "Institution",
    sequelize,
  },
);

Institution.hasMany(ProviderIntegration, {
  sourceKey: "ucp_id",
  foreignKey: "institution_id",
  as: "providerIntegrations",
});
