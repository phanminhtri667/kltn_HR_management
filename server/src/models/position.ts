"use strict";

import { Model } from "sequelize";

interface RoleAttributes {
  code: string;
  value: string;
  deleted: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Position extends Model implements RoleAttributes {

    code!: string;
    value!: string;
    deleted!: string;
    
    static associate(models: any) {
      Position.hasMany(models.EmploymentContract, { foreignKey: 'position_id', as: 'contracts' });

    }
  }
  Position.init(
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
      modelName: "Position",
    }
  );
  return Position;
};
