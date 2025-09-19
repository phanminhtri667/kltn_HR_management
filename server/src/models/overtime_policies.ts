"use strict";

import { Model, DataTypes } from "sequelize";

// Định nghĩa các thuộc tính của bảng overtime_policies
interface OvertimePolicyAttributes {
  id: number;             // Cột id, không phải là khóa chính
  code: string;           // Mã chính sách OT (OT_WEEKDAY, OT_WEEKEND, OT_HOLIDAY)
  day_type: string;       // Loại ngày: weekday, weekend, holiday
  multiplier: number;     // Hệ số nhân cho mỗi loại giờ OT
  start_time: string;     // Thời gian bắt đầu (định dạng HH:mm:ss)
  end_time: string;       // Thời gian kết thúc (định dạng HH:mm:ss)
}

module.exports = (sequelize: any) => {
  class OvertimePolicy extends Model<OvertimePolicyAttributes> implements OvertimePolicyAttributes {
    public id!: number;           // Cột id, không phải là khóa chính
    public code!: string;         // Mã chính sách OT
    public day_type!: string;     // Loại ngày
    public multiplier!: number;   // Hệ số nhân
    public start_time!: string;   // Thời gian bắt đầu
    public end_time!: string;     // Thời gian kết thúc
  }

  OvertimePolicy.init(
    {
      id: {
        type: DataTypes.INTEGER,     // Cột id, không phải là khóa chính, không có auto_increment
        allowNull: false,
        primaryKey: false,           // Không phải khóa chính
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,            // `code` làm khóa chính
      },
      day_type: {
        type: DataTypes.ENUM("weekday", "weekend", "holiday"),
        allowNull: false,
      },
      multiplier: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OvertimePolicy",
      tableName: "overtime_policies",  // Tên bảng trong cơ sở dữ liệu
      timestamps: false,  // Không cần timestamps (created_at, updated_at)
    }
  );

  return OvertimePolicy;
};
