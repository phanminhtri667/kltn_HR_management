import { Model, DataTypes, Optional } from 'sequelize';

interface ContractVersionAttrs {
  id: number;
  contract_id: number;
  template_id?: number | null;
  version_no: number;
  rendered_body_html?: string | null;
  rendered_body_pdf_path?: string | null;
  created_at?: Date;
}
type ContractVersionCreation = Optional<ContractVersionAttrs, 'id' | 'template_id' | 'rendered_body_html' | 'rendered_body_pdf_path' | 'created_at'>;

module.exports = (sequelize: any) => {
  class ContractVersion extends Model<ContractVersionAttrs, ContractVersionCreation>
    implements ContractVersionAttrs {
    public id!: number;
    public contract_id!: number;
    public template_id!: number | null;
    public version_no!: number;
    public rendered_body_html!: string | null;
    public rendered_body_pdf_path!: string | null;
    public created_at!: Date;

    static associate(models: any) {
      ContractVersion.belongsTo(models.EmploymentContract, { foreignKey: 'contract_id', as: 'contract' });
      ContractVersion.belongsTo(models.ContractTemplate, { foreignKey: 'template_id', as: 'template' });
    }
  }

  ContractVersion.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_id: { type: DataTypes.BIGINT, allowNull: false },
      template_id: { type: DataTypes.BIGINT, allowNull: true },
      version_no: { type: DataTypes.INTEGER, allowNull: false },
      rendered_body_html: { type: DataTypes.TEXT('long'), allowNull: true },
      rendered_body_pdf_path: { type: DataTypes.STRING(500), allowNull: true },
      created_at: { type: DataTypes.DATE }
    },
    { sequelize, modelName: 'ContractVersion', tableName: 'contract_versions', timestamps: false }
  );

  return ContractVersion;
};
