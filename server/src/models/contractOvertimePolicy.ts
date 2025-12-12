"use strict";
import { Model, DataTypes } from "sequelize";

module.exports = (sequelize: any) => {
  class ContractOvertimePolicy extends Model {
    public id!: number;
    public contract_id!: number;

    // cột tham chiếu composite tới overtime_policies (để join khi cần)
    public policy_code!: string;
    public policy_day_type!: "weekday" | "weekend" | "holiday";
    public policy_start_time!: string;
    public policy_end_time!: string;

    // snapshot dữ liệu chính sách tại thời điểm ký HĐ
    public code!: string;
    public day_type!: "weekday" | "weekend" | "holiday";
    public multiplier!: string; // DECIMAL as string
    public start_time!: string;
    public end_time!: string;

    public is_applied!: boolean;
    public created_at!: Date;

    static associate(models: any) {
      ContractOvertimePolicy.belongsTo(models.EmploymentContract, {
        foreignKey: "contract_id",
        as: "contract",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      // Không define belongsTo(OvertimePolicy) do composite FK; join thủ công khi cần.
    }
  }

  ContractOvertimePolicy.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_id: { type: DataTypes.BIGINT, allowNull: false },

      policy_code: { type: DataTypes.STRING(50), allowNull: false },
      policy_day_type: {
        type: DataTypes.ENUM("weekday", "weekend", "holiday"),
        allowNull: false,
      },
      policy_start_time: { type: DataTypes.TIME, allowNull: false },
      policy_end_time: { type: DataTypes.TIME, allowNull: false },

      code: { type: DataTypes.STRING(50), allowNull: false },
      day_type: {
        type: DataTypes.ENUM("weekday", "weekend", "holiday"),
        allowNull: false,
      },
      multiplier: { type: DataTypes.DECIMAL(4, 2), allowNull: false },
      start_time: { type: DataTypes.TIME, allowNull: false },
      end_time: { type: DataTypes.TIME, allowNull: false },

      is_applied: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: "ContractOvertimePolicy",
      tableName: "contract_overtime_policies",
      timestamps: false,
      indexes: [
        { fields: ["contract_id"], name: "idx_cop_contract" },
        {
          fields: ["policy_code", "policy_day_type", "policy_start_time", "policy_end_time"],
          name: "idx_cop_policy_ref",
        },
      ],
    }
  );

  return ContractOvertimePolicy;
};
