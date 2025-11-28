"use strict";
import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class WorkingHours extends Model {
    public id!: number;
    public code!: string;        // NEW
    public name!: string;        // NEW
    public day_mask!: string;    // NEW (1111100 = T2..T6)
    public start_time!: string;
    public end_time!: string;
    public grace_period!: number;

    static associate(models: any) {
      WorkingHours.hasMany(models.ContractWorkingHours, { foreignKey: 'working_hours_id', as: 'usages' });
    }
  }

  WorkingHours.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,           // UNIQUE như DB
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      day_mask: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: "1111100", // T2–T6 làm việc
        validate: {
          is: /^[01]{7}$/i,     // đúng 7 ký tự 0/1
        },
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      grace_period: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "WorkingHours",
      tableName: "working_hours",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["code"], name: "uq_working_hours_code" },
      ],
    }
  );

  return WorkingHours;
};
