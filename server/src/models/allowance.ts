"use strict";
import { Model } from "sequelize";

interface AllowanceAttributes {
  id: number;
  employee_id: string;
  code: string;
  name: string;
  amount: number;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Allowance extends Model<AllowanceAttributes> implements AllowanceAttributes {
    public id!: number;
    public employee_id!: string;
    public code!: string;
    public name!: string;
    public amount!: number;

    static associate(models: any) {
      // Liên kết với Employee
      Allowance.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        targetKey: "employee_id",
        as: "employee",
      });
    }
  }

  Allowance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      employee_id: {
        type: DataTypes.STRING,
        allowNull: false,
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
