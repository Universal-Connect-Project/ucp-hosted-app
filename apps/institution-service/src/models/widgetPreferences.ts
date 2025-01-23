import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  Model,
} from "sequelize";
import sequelize from "../database";
import { Aggregator } from "./aggregator";

export class WidgetPreferences extends Model {
  declare id: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare defaultAggregatorId: ForeignKey<Aggregator["id"]>;

  declare static associations: {
    defaultAggregator: Association<WidgetPreferences, Aggregator>;
  };
}

WidgetPreferences.init(
  {
    id: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true,
    },
    defaultAggregatorId: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "widgetPreferences",
    modelName: "WidgetPreferences",
    sequelize,
  },
);
