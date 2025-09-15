import { Model, DataTypes } from "sequelize";

interface TimekeepingAttributes {
  id: number;
  employee_id: number;
  work_date: Date;
  check_in: Date | null;
  check_out: Date | null;
  total_hours: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Timekeeping extends Model<TimekeepingAttributes> implements TimekeepingAttributes {
    id!: number;
    employee_id!: number;
    work_date!: Date;
    check_in!: Date | null;
    check_out!: Date | null;
    total_hours!: number;
    status!: string;
    createdAt?: Date;
    updatedAt?: Date;

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
      createdAt: {     
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {     
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Timekeeping",
      tableName: "Timekeeping",
      timestamps: true,
    }
  );

  return Timekeeping;
};