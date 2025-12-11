"use strict";

import { Model } from "sequelize";

interface RoleAttributes {
  code: string;
  value: string;
  deleted: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Role extends Model implements RoleAttributes {

    code!: string;
    value!: string;
    deleted!: string;
    
    static associate(models: any) {
      // define association here
      // Role.belongsToMany(models.Project, {
      //   through: "ProjectAssignments",
      // });
      Role.hasMany(models.User, {
  foreignKey: 'role_code',
  sourceKey: 'code',
});
    }
  }
  Role.init(
    {
      code: {
        type: DataTypes.STRING,
      },
      value: {
        type: DataTypes.STRING,
      },
      deleted: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "roles",       // <<< BẮT BUỘC PHẢI CÓ
      freezeTableName: true, 
    }
  );
  return Role;
};
