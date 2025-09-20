"use strict";
import { Model } from "sequelize";

module.exports = (sequelize: any, DataTypes: any) => {
  class WorkingHours extends Model {
    public id!: number;
    public start_time!: string;
    public end_time!: string;
    public grace_period!: number;

    static associate(models: any) {
      // Sau này có thể liên kết với Timekeeping nếu cần
    }
  }

  WorkingHours.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "WorkingHours",
      tableName: "working_hours",
      timestamps: false,   // ✅ vì bảng của bạn hiện tại không có created_at, updated_at
    }
  );

  return WorkingHours;
};