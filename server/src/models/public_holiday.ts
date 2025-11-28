// server/src/models/public_holiday.ts
"use strict";

module.exports = (sequelize: any, DataTypes: any) => {
  const PublicHoliday = sequelize.define(
    "PublicHoliday",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "public_holidays",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return PublicHoliday;
};
