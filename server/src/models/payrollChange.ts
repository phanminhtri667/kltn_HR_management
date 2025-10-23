import { Model, DataTypes } from 'sequelize';
import db from '../models'; // Đảm bảo bạn có import sequelize instance của bạn

interface PayrollChangeAttributes {
  id: number;
  payroll_id: number;
  change_type: 'status' | 'data';
  old_data: object;  // Dữ liệu cũ dưới dạng JSON
  new_data: object;  // Dữ liệu mới dưới dạng JSON
  changed_at: Date;
  description: string;
}

module.exports = (sequelize: any) => {
  class PayrollChange extends Model<PayrollChangeAttributes> implements PayrollChangeAttributes {
    public id!: number;
    public payroll_id!: number;
    public change_type!: 'status' | 'data';
    public old_data!: object;
    public new_data!: object;
    public changed_at!: Date;
    public description!: string;

    static associate(models: any) {
      // Quan hệ với bảng payroll_payslip_lines
      PayrollChange.belongsTo(models.PayrollPayslipLine, {
        foreignKey: 'payroll_id',  // Liên kết với cột payroll_id trong bảng payroll_payslip_lines
        targetKey: 'id',
        as: 'payrollPayslipLine',
      });
    }
  }

  PayrollChange.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      payroll_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      change_type: {
        type: DataTypes.ENUM('status', 'data'),
        allowNull: false,
      },
      old_data: {
        type: DataTypes.JSONB, // Lưu dưới dạng JSON
        allowNull: false,
      },
      new_data: {
        type: DataTypes.JSONB, // Lưu dưới dạng JSON
        allowNull: false,
      },
      changed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'PayrollChange',
      tableName: 'payroll_changes',
      timestamps: false, // Vì chúng ta tự quản lý thời gian thay đổi với `changed_at`
    }
  );

  return PayrollChange;
};
