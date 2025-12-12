"use strict";
import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class ContractAllowance extends Model {
    public id!: number;
    public contract_id!: number;
    public allowance_code!: string;
    public allowance_name!: string;
    public amount!: string; // DECIMAL as string
    public effective_date!: string;
    public is_applied!: boolean;
    public created_at!: Date;

    static associate(models: any) {
      ContractAllowance.belongsTo(models.EmploymentContract, {
        foreignKey: "contract_id",
        as: "contract",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  ContractAllowance.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_id: { type: DataTypes.BIGINT, allowNull: false },

      allowance_code: { type: DataTypes.STRING(50), allowNull: false },
      allowance_name: { type: DataTypes.STRING(255), allowNull: false },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

      effective_date: { type: DataTypes.DATEONLY, allowNull: true },
      is_applied: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: "ContractAllowance",
      tableName: "contract_allowances",
      timestamps: false,
      indexes: [{ fields: ["contract_id"], name: "idx_callow_contract" }],
    }
  );

  return ContractAllowance;
};
