'use strict';

import {
  Model, 
} from 'sequelize';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  role_code: string;
  department_id: number;
  deleted:string
}

module.exports = (sequelize: any, DataTypes: any) => {
  class User extends Model<UserAttributes> 
  implements UserAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    id!: string;
    name!: string;
    email!: string;
    password!: string;
    role_code!: string;
    department_id!: number;
    deleted!: string;
    static associate(models: any) {
      User.belongsTo(models.Role, {
        foreignKey: 'role_code', targetKey: 'code'
      });
      User.belongsTo(models.Department, {
        foreignKey: 'department_id', targetKey: 'id'
      });
    }
  };
  User.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }, 
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department_id: {  // Thêm department_id
      type: DataTypes.INTEGER,
      allowNull: true, // Nếu có thể không có phòng ban cho một số người dùng
      references: {
        model: 'Departments',  // Liên kết với bảng Departments
        key: 'id',
      },
    },
    deleted: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};