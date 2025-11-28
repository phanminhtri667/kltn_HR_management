'use strict';

import { Model } from 'sequelize';

interface UserAttributes {
  id: number;                 // <-- INT auto increment
  name: string;
  email: string;
  password: string;
  role_code: string;
  department_id: number | null; // <-- có thể null
  deleted?: string | null;      // <-- tuỳ bạn, để optional cho an toàn
}

module.exports = (sequelize: any, DataTypes: any) => {
  class User extends Model<UserAttributes> implements UserAttributes {
    id!: number;
    name!: string;
    email!: string;
    password!: string;
    role_code!: string;
    department_id!: number | null;
    deleted?: string | null;

    static associate(models: any) {
      User.belongsTo(models.Role, {
        foreignKey: 'role_code',
        targetKey: 'code',
      });
      User.belongsTo(models.Department, {
        foreignKey: 'department_id',
        targetKey: 'id',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,     // <-- khớp DB
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Departments',
          key: 'id',
        },
      },
      deleted: {
        type: DataTypes.STRING,
        allowNull: true, // đồng bộ với interface optional
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users', 
      freezeTableName: true,
    }
  );

  return User;
};
