"use strict";
import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class ContractWorkingHours extends Model {
    public id!: number;
    public contract_id!: number;
    public working_hours_id!: number;
    public code!: string;
    public name!: string;
    public day_mask!: string;
    public start_time!: string;
    public end_time!: string;
    public grace_period!: number;
    public created_at!: Date;

    static associate(models: any) {
      ContractWorkingHours.belongsTo(models.EmploymentContract, {
        foreignKey: "contract_id",
        as: "contract",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      ContractWorkingHours.belongsTo(models.WorkingHours, {
        foreignKey: "working_hours_id",
        as: "workingHours",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      });
    }
  }

  ContractWorkingHours.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_id: { type: DataTypes.BIGINT, allowNull: false },
      working_hours_id: { type: DataTypes.INTEGER, allowNull: false },

      code: { type: DataTypes.STRING(50), allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: false },
      day_mask: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: "1111100",
        validate: { is: /^[01]{7}$/ },
      },
      start_time: { type: DataTypes.TIME, allowNull: false },
      end_time: { type: DataTypes.TIME, allowNull: false },
      grace_period: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: "ContractWorkingHours",
      tableName: "contract_working_hours",
      timestamps: false,
      indexes: [
        { fields: ["contract_id"], name: "idx_cwh_contract" },
        { fields: ["working_hours_id"], name: "idx_cwh_wh" },
      ],
    }
  );

  return ContractWorkingHours;
};
