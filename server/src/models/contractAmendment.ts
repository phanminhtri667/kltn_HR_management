import { Model, DataTypes, Optional } from 'sequelize';

interface ContractAmendmentAttrs {
  id: number;
  contract_id: number;
  amend_type: 'salary_change' | 'title_change' | 'term_extension' | 'other';
  details_json: object; // JSON
  effective_date: Date;
  approved_by?: number | null;
  approved_by_employee_id?: string | null;
  created_at?: Date;
}
type ContractAmendmentCreation = Optional<ContractAmendmentAttrs, 'id' | 'approved_by' | 'created_at'>;

module.exports = (sequelize: any) => {
  class ContractAmendment extends Model<ContractAmendmentAttrs, ContractAmendmentCreation>
    implements ContractAmendmentAttrs {
    public id!: number;
    public contract_id!: number;
    public amend_type!: ContractAmendmentAttrs['amend_type'];
    public details_json!: object;
    public effective_date!: Date;
    public approved_by!: number | null;
    public approved_by_employee_id!: string | null;
    public created_at!: Date;

    static associate(models: any) {
      ContractAmendment.belongsTo(models.EmploymentContract, { foreignKey: 'contract_id', as: 'contract' });
    }
  }

  ContractAmendment.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_id: { type: DataTypes.BIGINT, allowNull: false },
      amend_type: { type: DataTypes.ENUM('salary_change','title_change','term_extension','other'), allowNull: false },
      details_json: { type: DataTypes.JSON, allowNull: false },
      effective_date: { type: DataTypes.DATEONLY, allowNull: false },
      approved_by: { type: DataTypes.INTEGER, allowNull: true },
      approved_by_employee_id: { type: DataTypes.STRING(64), allowNull: true },
      created_at: { type: DataTypes.DATE }
    },
    { sequelize, modelName: 'ContractAmendment', tableName: 'contract_amendments', timestamps: false }
  );

  return ContractAmendment;
};
