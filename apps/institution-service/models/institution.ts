import { Association, CreationOptional, DataTypes, HasManyGetAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import sequelize from '../config/database';
import { Provider } from "./provider";

export class Institution extends Model<InferAttributes<Institution, {omit: 'providers'}>, InferCreationAttributes<Institution>> {
  declare ucp_id: string;
  declare name: string;
  declare keywords: string;
  declare logo: string;
  declare url: string;
  declare is_test_bank: boolean;
  declare is_hidden: boolean;
  declare routing_numbers: string[];

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getProviders: HasManyGetAssociationsMixin<Provider>;

  declare providers?: NonAttribute<Provider[]>;

  declare static associations: {
    providers: Association<Institution, Provider>
  }
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
      unique: true,
    },
    keywords: DataTypes.TEXT,
    logo: DataTypes.TEXT,
    url: DataTypes.TEXT,
    is_test_bank: DataTypes.BOOLEAN,
    is_hidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    routing_numbers: DataTypes.ARRAY(DataTypes.TEXT),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: 'institutions',
    modelName: 'Institution',
    sequelize
  }
)

Institution.hasMany(Provider, {
  sourceKey: 'ucp_id',
  foreignKey: 'institution_id',
  as: 'providers'
})
// Provider.belongsTo(Institution, {
//   foreignKey: 'institution_id'
// })
