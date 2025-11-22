import { Model, DataTypes, Optional } from 'sequelize';

interface ContractAttachmentAttrs {
  id: number;
  contract_id: number;
  file_path: string;
  file_type?: string | null;
  notes?: string | null;
  uploaded_by?: number | null;
  uploaded_by_employee_id?: string | null;
  uploaded_at?: Date;
}
type ContractAttachmentCreation = Optional<ContractAttachmentAttrs, 'id' | 'file_type' | 'notes' | 'uploaded_by' | 'uploaded_at'>;

module.exports = (sequelize: any) => {
  class ContractAttachment extends Model<ContractAttachmentAttrs, ContractAttachmentCreation>
    implements ContractAttachmentAttrs {
    public id!: number;
    public contract_id!: number;
    public file_path!: string;
    public file_type!: string | null;
    public notes!: string | null;
    public uploaded_by!: number | null;
    public uploaded_by_employee_id!: string | null;
    public uploaded_at!: Date;

    static associate(models: any) {
      ContractAttachment.belongsTo(models.EmploymentContract, { foreignKey: 'contract_id', as: 'contract' });
    }
  }

  ContractAttachment.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_id: { type: DataTypes.BIGINT, allowNull: false },
      file_path: { type: DataTypes.STRING(500), allowNull: false },
      file_type: { type: DataTypes.STRING(100), allowNull: true },
      notes: { type: DataTypes.STRING(255), allowNull: true },
      uploaded_by: { type: DataTypes.INTEGER, allowNull: true },
      uploaded_by_employee_id: { type: DataTypes.STRING(64), allowNull: true },
      uploaded_at: { type: DataTypes.DATE }
    },
    { sequelize, modelName: 'ContractAttachment', tableName: 'contract_attachments', timestamps: false }
  );

  return ContractAttachment;
};
