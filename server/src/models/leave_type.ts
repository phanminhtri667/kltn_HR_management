"use strict";

import { Model } from "sequelize";

interface LeaveTypeAttributes {
  id?: number;
  code: string;
  name: string;
  paid: boolean;
  allow_half_day: boolean;
  requires_document: boolean;
  max_days_per_request?: number;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class LeaveType extends Model<LeaveTypeAttributes> implements LeaveTypeAttributes {
    public id!: number;
    public code!: string;
    public name!: string;
    public paid!: boolean;
    public allow_half_day!: boolean;
    public requires_document!: boolean;
    public max_days_per_request?: number;

    static associate(models: any) {
      // 1 loại nghỉ có thể có nhiều request
      LeaveType.hasMany(models.LeaveRequest, {
        foreignKey: "type_id",
        as: "requests",
      });
    }
  }

  LeaveType.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: DataTypes.STRING,
      name: DataTypes.STRING,
      paid: { type: DataTypes.BOOLEAN, defaultValue: true },
      allow_half_day: { type: DataTypes.BOOLEAN, defaultValue: true },
      requires_document: { type: DataTypes.BOOLEAN, defaultValue: false },
      max_days_per_request: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    },
    {
      sequelize,
      modelName: "LeaveType",
      tableName: "leave_types",
      timestamps: true,
      createdAt: "created_at",   
      updatedAt: "updated_at", 
    }
  );

  return LeaveType;
};
