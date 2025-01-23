import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  Model,
} from "sequelize";
import sequelize from "../database";
import { Aggregator } from "./aggregator";
import { WidgetPreferences } from "./widgetPreferences";

export class SupportedAggregator extends Model {
  declare id: CreationOptional<number>;
  declare aggregatorId: ForeignKey<Aggregator["id"]>;
  declare widgetPreferencesId: ForeignKey<WidgetPreferences["id"]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare static associations: {
    aggregator: Association<SupportedAggregator, Aggregator>;
  };
}

SupportedAggregator.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    aggregatorId: {
      type: DataTypes.INTEGER,
    },
    widgetPreferencesId: {
      type: DataTypes.INTEGER,
    },
    createdAt: { type: DataTypes.DATE, defaultValue: new Date() },
    updatedAt: { type: DataTypes.DATE, defaultValue: new Date() },
  },
  {
    tableName: "supportedAggregators",
    modelName: "SupportedAggregator",
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ["widgetPreferencesId", "aggregatorId"],
      },
    ],
  },
);
