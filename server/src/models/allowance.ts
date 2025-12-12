"use strict";
import { Model, DataTypes } from "sequelize";

interface AllowanceAttributes {
  id: number;
  code: string;
  name: string;
  amount: number;
}

module.exports = (sequelize: any) => {
  class Allowance extends Model<AllowanceAttributes> implements AllowanceAttributes {
    public id!: number;
    public code!: string;
    public name!: string;
    public amount!: number;
  }

  Allowance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Allowance",
      tableName: "allowances",
      timestamps: false,
    }
  );

  return Allowance;
};
