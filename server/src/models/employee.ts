import { Model, DataTypes } from "sequelize";

interface EmployeeAttributes {
  employee_id: string;
  full_name: string;
  first_name: string;
  phone: string;
  email: string;
  gender: string;
  dayOfBirth: Date;
  department_id: string;
  position_id: string;
  deleted: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Employee extends Model<EmployeeAttributes> implements EmployeeAttributes {
    employee_id!: string;
    full_name!: string;
    first_name!: string;
    phone!: string;
    email!: string;
    gender!: string;
    dayOfBirth!: Date;
    department_id!: string;
    position_id!: string;
    deleted!: string;

    static associate(models: any) {
      Employee.belongsTo(models.Department,{
        foreignKey: 'department_id',
        targetKey: 'code',
        as: 'department'
      })
      Employee.belongsTo(models.Position,{
        foreignKey: 'position_id',
        targetKey: 'code',
        as: 'position'
      })
    }
  }

  Employee.init(
    {
      employee_id: {
        allowNull: true,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      full_name: {
        type: DataTypes.STRING,
      },
      first_name: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      gender:{
        type: DataTypes.STRING
      },
      dayOfBirth:{
        type: DataTypes.DATE
      },
      department_id: {
        type: DataTypes.STRING,
      },
      position_id: {
        type: DataTypes.STRING,
      },
      deleted: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Employee",
    }
  );

//   Employee.beforeCreate(async (employee, options) => {
//     employee.employee_id = await generateEmployeeId();
//   });
  
//  const generateEmployeeId = async() => {
//   const lastEmployee = await Employee.findOne({
//     order: [["employee_id", "DESC"]],
//     attributes: ["employee_id"],
//   });

//   if(lastEmployee) {
//     let newEmployeeId = lastEmployee.toString().slice(2)
//     return newEmployeeId = (Number(newEmployeeId)+1).toString().padStart(3, "0")
//   }
//     return 'nv001'
//   }

  return Employee;
};
