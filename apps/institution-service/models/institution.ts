import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Provider } from "./provider";

@Table
export class Institution extends Model {
  @Column({
    type: DataType.TEXT,
    unique: true,
    primaryKey: true,
  })
  ucp_id: string;

  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  name: string;

  @Column(DataType.TEXT)
  keywords: string;

  @Column(DataType.TEXT)
  logo: string;

  @Column(DataType.TEXT)
  url: string;

  @Column(DataType.BOOLEAN)
  is_test_bank: boolean;

  @Column(DataType.BOOLEAN)
  is_hidden: boolean;

  @Column(DataType.ARRAY(DataType.TEXT))
  routing_numbers: string[];

  @HasMany(() => Provider)
  providers: Provider[];
}
