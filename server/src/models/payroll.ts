import { Model, DataTypes } from "sequelize";

interface PayrollPayslipLineAttributes {
  id: number;
  employee_id: string;
  total_work_hours: number;
  actual_salary: number;
  ot_weekday_hours: number;
  ot_weekend_hours: number;
  ot_holiday_hours: number;
  overtime_amount: number;
  allowance: number;
  total_amount: number;
  deduction: number;
  received_salary: number;
  month: string;
  absent_days: number;  // Thêm cột absent_days
  created_at: Date;
  updated_at: Date;
  status: "draft" | "approved" | "paid";
}

module.exports = (sequelize: any) => {
  class PayrollPayslipLine extends Model<PayrollPayslipLineAttributes> implements PayrollPayslipLineAttributes {
    public id!: number;
    public employee_id!: string;
    public total_work_hours!: number;
    public actual_salary!: number;
    public ot_weekday_hours!: number;
    public ot_weekend_hours!: number;
    public ot_holiday_hours!: number;
    public overtime_amount!: number;
    public allowance!: number;
    public total_amount!: number;
    public deduction!: number;
    public received_salary!: number;
    public month!: string;
    public absent_days!: number;  // Thêm cột absent_days
    public created_at!: Date;
    public updated_at!: Date;
    public status!: "draft" | "approved" | "paid";

    static associate(models: any) {
      PayrollPayslipLine.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        targetKey: "employee_id",
        as: "employee",  // Alias cho liên kết
      });
    }
  }

  PayrollPayslipLine.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      employee_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_work_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
      },
      actual_salary: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
      },
      ot_weekday_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
      },
      ot_weekend_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
      },
      ot_holiday_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
      },
      overtime_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
      },
      allowance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      deduction: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      received_salary: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
      },
      month: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      absent_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0,  // Default là 0 nếu không có giá trị
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("draft", "approved", "paid"),
        allowNull: false,
        defaultValue: "draft",
      },
    },
    {
      sequelize,
      modelName: "PayrollPayslipLine",
      tableName: "payroll_payslip_lines",
      timestamps: false,
    }
  );

  return PayrollPayslipLine;
};
