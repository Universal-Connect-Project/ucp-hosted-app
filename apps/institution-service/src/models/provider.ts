import {
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

export enum supportedProviders {
  MX = "mx",
  SOPHTRON = "sophtron",
}
export class Provider extends Model<
  InferAttributes<Provider>,
  InferCreationAttributes<Provider>
> {
  declare id: CreationOptional<number>;
  declare provider_institution_id: string;
  declare name: string;
  declare supports_oauth: CreationOptional<boolean>;
  declare supports_identification: CreationOptional<boolean>;
  declare supports_verification: CreationOptional<boolean>;
  declare supports_aggregation: CreationOptional<boolean>;
  declare supports_history: CreationOptional<boolean>;
  declare institution_id: ForeignKey<Institution["ucp_id"]>;

  declare institution?: NonAttribute<Institution>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Provider.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    provider_institution_id: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
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
    tableName: "providers",
    modelName: "Provider",
    sequelize,
  },
);
