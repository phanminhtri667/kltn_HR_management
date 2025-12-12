import { Model, DataTypes } from "sequelize";

interface SystemSettingAttributes {
  setting_key: string;
  setting_value: string;
  updated_at: Date;
}

module.exports = (sequelize: any) => {
  class SystemSetting 
    extends Model<SystemSettingAttributes>
    implements SystemSettingAttributes 
  {
    public setting_key!: string;
    public setting_value!: string;
    public updated_at!: Date;

    static associate(models: any) {
      // Không cần quan hệ
    }
  }

  SystemSetting.init(
    {
      setting_key: {
        type: DataTypes.STRING(100),
        primaryKey: true,
      },
      setting_value: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SystemSetting",
      tableName: "system_settings",
      timestamps: false,
    }
  );

  return SystemSetting;
};
