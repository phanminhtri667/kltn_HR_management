"use strict";
import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class ContractDeduction extends Model {
    public id!: number;
    public contract_id!: number;
    public deduction_code!: string;
    public deduction_name!: string;
    public percent!: string; // DECIMAL as string
    public effective_date!: string;
    public is_applied!: boolean;
    public created_at!: Date;

    static associate(models: any) {
      ContractDeduction.belongsTo(models.EmploymentContract, {
        foreignKey: "contract_id",
        as: "contract",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  ContractDeduction.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_id: { type: DataTypes.BIGINT, allowNull: false },

      deduction_code: { type: DataTypes.STRING(50), allowNull: false },
      deduction_name: { type: DataTypes.STRING(255), allowNull: false },
      percent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },

      effective_date: { type: DataTypes.DATEONLY, allowNull: true },
      is_applied: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: "ContractDeduction",
      tableName: "contract_deductions",
      timestamps: false,
      indexes: [{ fields: ["contract_id"], name: "idx_cdeduct_contract" }],
    }
  );

  return ContractDeduction;
};
