import { Model, DataTypes } from "sequelize";

interface TimekeepingAttributes {
  id: number;
  employee_id: string;
  work_date: Date;
  check_in: Date | null;
  check_out: Date | null;
  total_hours: number;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Timekeeping extends Model<TimekeepingAttributes> implements TimekeepingAttributes {
    id!: number;
    employee_id!: string;
    work_date!: Date;
    check_in!: Date | null;
    check_out!: Date | null;
    total_hours!: number;
    status!: string;
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
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      work_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      check_in: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      check_out: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      total_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("normal", "late", "early", "absent"),
        defaultValue: "normal",
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
      modelName: "Timekeeping",
      tableName: "timekeeping",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Timekeeping;
};
