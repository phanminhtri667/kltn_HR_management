"use strict";

import { Model, DataTypes } from "sequelize";

// Giữ nguyên naming & cấu trúc như bạn đang dùng (bảng: overtime_policies)
interface OvertimePolicyAttributes {
  id: number;            // int(11) NOT NULL (không phải PK/AI)
  code: string;          // PRIMARY KEY (varchar(50))
  day_type: "weekday" | "weekend" | "holiday"; // enum(...)
  multiplier: number;    // DECIMAL(4,2) NOT NULL
  start_time: string;    // TIME NOT NULL
  end_time: string;      // TIME NOT NULL
}

module.exports = (sequelize: any) => {
  class OvertimePolicy
    extends Model<OvertimePolicyAttributes>
    implements OvertimePolicyAttributes {
    public id!: number;
    public code!: string;
    public day_type!: "weekday" | "weekend" | "holiday";
    public multiplier!: number;
    public start_time!: string;
    public end_time!: string;

    static associate(_models: any) {
      // Không cần associations ở đây
    }
  }

  OvertimePolicy.init(
    {
      // id: int(11) NOT NULL (không PK, không AI)
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // code: PK theo DB
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      // enum như trong DB
      day_type: {
        type: DataTypes.ENUM("weekday", "weekend", "holiday"),
        allowNull: false,
      },
      // DECIMAL(4,2) theo DB
      multiplier: {
        type: DataTypes.DECIMAL(4, 2),
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
      tableName: "overtime_policies",
      timestamps: false, // bảng không có created_at/updated_at
    }
  );

  return OvertimePolicy;
};
