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
    deleted!: string;
    static associate(models: any) {
      User.belongsTo(models.Role, {
        foreignKey: 'role_code', targetKey: 'code'
      })
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
    deleted: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};