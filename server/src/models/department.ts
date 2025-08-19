"use strict";

import { Model } from "sequelize";

interface RoleAttributes {
  code: string;
  value: string;
  deleted: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Department extends Model implements RoleAttributes {
    code!: string;
    value!: string;
    deleted!: string;

    static associate(models: any) {
      // define association here
      // Department.belongsToMany(models.Project, {
      //   through: "ProjectAssignments",
      // });
    }
  }
  Department.init(
    {
      code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
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
      modelName: "Department",
    }
  );
  return Department;
};
