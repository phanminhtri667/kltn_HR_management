"use strict";

import { Model } from "sequelize";

interface EmployeeAttributes {
  employee_id: string;
  full_name: string;
  first_name: string;
  phone: string;
  email: string;
  gender: string;
  dayOfBirth: Date;
  department_id: number;
  position_id: number;
  deleted: string;
  password: string;       
  role_code: string;      
  basic_salary: number; 
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Employee extends Model<EmployeeAttributes> implements EmployeeAttributes {
    public employee_id!: string;
    public full_name!: string;
    public first_name!: string;
    public phone!: string;
    public email!: string;
    public gender!: string;
    public dayOfBirth!: Date;
    public department_id!: number;
    public position_id!: number;
    public deleted!: string;
    public password!: string;      
    public role_code!: string;     
    public basic_salary!: number;

    static associate(models: any) {
      // Liên kết với Department
      Employee.belongsTo(models.Department, {
        foreignKey: "department_id",
        targetKey: "id",
        as: "department",
      });

      // Liên kết với Position
      Employee.belongsTo(models.Position, {
        foreignKey: "position_id",
        targetKey: "id",
        as: "position",
      });

      // Liên kết với Timekeeping
      Employee.hasMany(models.Timekeeping, {
        foreignKey: "employee_id",
        sourceKey: "employee_id",
        as: "Timekeepings",
      });
      Employee.hasMany(models.EmploymentContract, { foreignKey: 'employee_id', as: 'contracts' });

    }
  }

  Employee.init(
    {
      employee_id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      full_name: DataTypes.STRING,
      first_name: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      gender: DataTypes.STRING,
      dayOfBirth: DataTypes.DATE,
      department_id: DataTypes.INTEGER,
      position_id: DataTypes.INTEGER,
      deleted: DataTypes.STRING,
      password: DataTypes.STRING,
      role_code: {
        type: DataTypes.STRING,
        defaultValue: "role_3",
      },
      basic_salary: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      modelName: "Employee",
      tableName: "employees", 
      timestamps: true,
    }
  );

  return Employee;
};
