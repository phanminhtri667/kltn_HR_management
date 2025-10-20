"use strict";

import { Model } from "sequelize";

interface LeaveRequestAttributes {
  id?: number;
  employee_id: string;
  department_id: number;
  type_id: number;
  start_date: Date;
  end_date: Date;
  reason?: string;
  status?: string;
  approver_id?: string;
  approved_at?: Date;
  rejected_at?: Date;
  reject_reason?: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class LeaveRequest extends Model<LeaveRequestAttributes> implements LeaveRequestAttributes {
    public id!: number;
    public employee_id!: string;
    public department_id!: number;
    public type_id!: number;
    public start_date!: Date;
    public end_date!: Date;
    public reason?: string;
    public status?: string;
    public approver_id?: string;
    public approved_at?: Date;
    public rejected_at?: Date;
    public reject_reason?: string;

    static associate(models: any) {
      // Mỗi request thuộc 1 loại nghỉ
      LeaveRequest.belongsTo(models.LeaveType, {
        foreignKey: "type_id",
        as: "leave_type",
      });

      // Mỗi request thuộc 1 nhân viên
      LeaveRequest.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        targetKey: "employee_id",
        as: "employee",
      });

      // Mỗi request thuộc 1 phòng ban
      LeaveRequest.belongsTo(models.Department, {
        foreignKey: "department_id",
        as: "department",
      });
    }
  }

  LeaveRequest.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: DataTypes.STRING, allowNull: false },
      department_id: DataTypes.INTEGER,
      type_id: DataTypes.INTEGER,
      start_date: DataTypes.DATEONLY,
      end_date: DataTypes.DATEONLY,
      reason: DataTypes.TEXT,
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "CANCELLED"),
        defaultValue: "PENDING",
      },
      approver_id: DataTypes.STRING,
      approved_at: DataTypes.DATE,
      rejected_at: DataTypes.DATE,
      reject_reason: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "LeaveRequest",
      tableName: "leave_requests",
      timestamps: true,
    }
  );

  return LeaveRequest;
};
