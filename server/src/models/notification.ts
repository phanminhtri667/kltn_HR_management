"use strict";

import { Model } from "sequelize";

interface NotificationAttributes {
  id: number;
  message: string;
  is_read: boolean;
  employee_id?: string | null;
  user_id?: number | null;
  type?: string | null;
  link?: string | null;
  deleted?: boolean;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Notification
    extends Model<NotificationAttributes>
    implements NotificationAttributes
  {
    id!: number;
    message!: string;
    is_read!: boolean;
    employee_id!: string | null;
    user_id!: number | null;
    type!: string | null;
    link!: string | null;
    deleted!: boolean;

    static associate(models: any) {
      // 🔗 Mỗi thông báo có thể thuộc về 1 user (ví dụ admin / manager)
      Notification.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      // 🔗 Mỗi thông báo có thể thuộc về 1 nhân viên (employee)
      Notification.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        targetKey: "employee_id", // vì cột employee_id không phải là khóa số tự tăng
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      employee_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      link: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications",
      timestamps: true, // để có createdAt, updatedAt
    }
  );

  return Notification;
};
