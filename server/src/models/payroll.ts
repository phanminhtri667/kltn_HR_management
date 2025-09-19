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
  created_at: Date;
  updated_at: Date;
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
    public created_at!: Date;
    public updated_at!: Date;

    static associate(models: any) {
      // Liên kết với Employee
      PayrollPayslipLine.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        targetKey: "employee_id",
        as: "employee",  // Alias cho liên kết
      });
      // Liên kết với Timekeeping (nếu cần thiết để lấy giờ công làm việc)
      PayrollPayslipLine.belongsTo(models.Timekeeping, {
        foreignKey: "employee_id",  // Liên kết với bảng Timekeeping qua `employee_id`
        targetKey: "employee_id",   // Khóa chính trong bảng Timekeeping
        as: "timekeeping",          // Alias cho liên kết
      });
      

    }
  }

  PayrollPayslipLine.init(
    {
      id: {
   
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
      },
      employee_id: {
        allowNull: false,
        type: DataTypes.STRING,
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
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
