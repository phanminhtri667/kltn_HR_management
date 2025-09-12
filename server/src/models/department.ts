"use strict";

import { Model } from "sequelize";

interface DepartmentAttributes {
  id: number;
  code: string;
  value: string;
  deleted: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Department extends Model<DepartmentAttributes> implements DepartmentAttributes {
    public id!: number;
    public code!: string;
    public value!: string;
    public deleted!: string;

    static associate(models: any) {
      // Liên kết với Employee
      Department.hasMany(models.Employee, {
        foreignKey: "department_id",
        as: "employees",
      });
    }
  }

  Department.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      value: DataTypes.STRING,
      deleted: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Department",
      tableName: "departments", // ✅ rõ ràng
      timestamps: true,
    }
  );

  return Department;
};
