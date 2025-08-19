"use strict";

import { Model } from "sequelize";

interface NotificationAttributes {
  id: string;
  message: string;
  is_read: boolean;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Notification
    extends Model<NotificationAttributes>
    implements NotificationAttributes
  {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    id!: string;
    message!: string;
    is_read!: boolean;
    static associate(models: any) {}
  }
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );
  return Notification;
};
