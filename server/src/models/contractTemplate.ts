import { Model, DataTypes, Optional } from 'sequelize';

interface ContractTemplateAttrs {
  id: number;
  name: string;
  version: number;
  locale: string;
  body_markdown?: string | null;
  placeholders: object;   // JSON
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}
type ContractTemplateCreation = Optional<ContractTemplateAttrs, 'id' | 'body_markdown' | 'created_at' | 'updated_at'>;

module.exports = (sequelize: any) => {
  class ContractTemplate extends Model<ContractTemplateAttrs, ContractTemplateCreation>
    implements ContractTemplateAttrs {
    public id!: number;
    public name!: string;
    public version!: number;
    public locale!: string;
    public body_markdown!: string | null;
    public placeholders!: object;
    public is_active!: boolean;
    public created_at!: Date;
    public updated_at!: Date;

    static associate(models: any) {
      // 1 template -> N contracts
      ContractTemplate.hasMany(models.EmploymentContract, {
        foreignKey: 'template_id',
        as: 'contracts',
        onDelete: 'SET NULL'
      });
      // 1 template -> N contract_versions (optional)
      ContractTemplate.hasMany(models.ContractVersion, {
        foreignKey: 'template_id',
        as: 'versionsFromTemplate'
      });
    }
  }

  ContractTemplate.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      locale: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'vi-VN' },
      body_markdown: { type: DataTypes.TEXT('long'), allowNull: true },
      placeholders: { type: DataTypes.JSON, allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE },
      updated_at: { type: DataTypes.DATE }
    },
    { sequelize, modelName: 'ContractTemplate', tableName: 'contract_templates', timestamps: false }
  );

  return ContractTemplate;
};
