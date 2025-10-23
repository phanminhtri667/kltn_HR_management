import { Model, DataTypes, Optional } from 'sequelize';

interface ContractAuditAttrs {
  id: number;
  contract_id: number;
  action: string; // create/update/approve/send_for_sign/sign/activate/terminate/auto_expire...
  by_user?: number | null;
  at?: Date;
  meta: object; // JSON
}
type ContractAuditCreation = Optional<ContractAuditAttrs, 'id' | 'by_user' | 'at'>;

module.exports = (sequelize: any) => {
  class ContractAudit extends Model<ContractAuditAttrs, ContractAuditCreation>
    implements ContractAuditAttrs {
    public id!: number;
    public contract_id!: number;
    public action!: string;
    public by_user!: number | null;
    public at!: Date;
    public meta!: object;

    static associate(models: any) {
      ContractAudit.belongsTo(models.EmploymentContract, { foreignKey: 'contract_id', as: 'contract' });
    }
  }

  ContractAudit.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_id: { type: DataTypes.BIGINT, allowNull: false },
      action: { type: DataTypes.STRING(50), allowNull: false },
      by_user: { type: DataTypes.INTEGER, allowNull: true },
      at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      meta: { type: DataTypes.JSON, allowNull: false }
    },
    { sequelize, modelName: 'ContractAudit', tableName: 'contract_audits', timestamps: false }
  );

  return ContractAudit;
};
