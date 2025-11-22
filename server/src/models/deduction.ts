"use strict";

import { Model, DataTypes } from "sequelize";

interface DeductionAttributes {
  id: number;
  code: string;
  name: string;
  percent: number; // DECIMAL(5,2)
}

module.exports = (sequelize: any) => {
  class Deduction
    extends Model<DeductionAttributes>
    implements DeductionAttributes
  {
    public id!: number;
    public code!: string;
    public name!: string;
    public percent!: number;

    static associate(_models: any) {
      // Chưa cần associations
    }
  }

  Deduction.init(
    {
      id: {
        type: DataTypes.INTEGER, // int(11)
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      modelName: "Deduction",         // <-- tên này để dùng db.Deduction
      tableName: "deductions",
      timestamps: false,              // bảng không có created_at/updated_at
    }
  );

  return Deduction;
};
