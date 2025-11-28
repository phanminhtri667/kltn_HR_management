import { Model, DataTypes } from "sequelize";

interface TimekeepingAttributes {
  id: number;
  employee_id: string;
  department_id?: number | null;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number;
  status: string;
  ot_weekday_hours: number;  
  ot_weekend_hours: number;  
  ot_holiday_hours: number; 
  created_at?: Date;
  updated_at?: Date;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Timekeeping extends Model<TimekeepingAttributes> implements TimekeepingAttributes {
    id!: number;
    employee_id!: string;
    department_id!: number | null;
    work_date!: string;
    check_in!: string | null;
    check_out!: string | null;
    total_hours!: number;
    status!: string;
    ot_weekday_hours!: number;  
    ot_weekend_hours!: number; 
    ot_holiday_hours!: number; 
    created_at?: Date;
    updated_at?: Date;

    static associate(models: any) {
      Timekeeping.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        targetKey: "employee_id",
        as: "employee",
      });
    }
  }

  Timekeeping.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      department_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      work_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      check_in: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      check_out: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      total_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "On time",
      },
      ot_weekday_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,  // Giờ làm thêm trong tuần
      },
      ot_weekend_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,  // Giờ làm thêm cuối tuần
      },
      ot_holiday_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,  // Giờ làm thêm ngày lễ
      }
    },
    {
      sequelize,
      modelName: "Timekeeping",
      tableName: "Timekeeping",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Timekeeping;
};