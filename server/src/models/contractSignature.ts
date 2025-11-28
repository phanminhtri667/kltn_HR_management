import { Model, DataTypes, Optional } from 'sequelize';

interface ContractSignatureAttrs {
  id: number;
  contract_id: number;
  signer_employee_id?: string | null;   // mã nhân viên (VARCHAR)
  signer_user_id?: number | null;       // id user (INT)
  signer_name?: string | null;
  signer_role: 'employee' | 'hr' | 'legal' | 'manager' | 'representative';
  sign_order: number;
  sign_status: 'pending' | 'signed' | 'rejected';
  signed_at?: Date | null;
  signature_evidence?: object | null;   // JSON
}

type ContractSignatureCreation = Optional<
  ContractSignatureAttrs,
  'id' | 'signer_employee_id' | 'signer_user_id' | 'signer_name' | 'signed_at' | 'signature_evidence'
>;

module.exports = (sequelize: any) => {
  class ContractSignature
    extends Model<ContractSignatureAttrs, ContractSignatureCreation>
    implements ContractSignatureAttrs
  {
    public id!: number;
    public contract_id!: number;
    public signer_employee_id!: string | null;
    public signer_user_id!: number | null;
    public signer_name!: string | null;
    public signer_role!: ContractSignatureAttrs['signer_role'];
    public sign_order!: number;
    public sign_status!: ContractSignatureAttrs['sign_status'];
    public signed_at!: Date | null;
    public signature_evidence!: object | null;

    static associate(models: any) {
      // Liên kết đến hợp đồng
      ContractSignature.belongsTo(models.EmploymentContract, {
        foreignKey: 'contract_id',
        as: 'contract',
      });

      // Liên kết đến nhân viên (nếu là employee)
      ContractSignature.belongsTo(models.Employee, {
        foreignKey: 'signer_employee_id',
        targetKey: 'employee_id',
        as: 'signerEmployee',
      });

      // Liên kết đến user (nếu là HR, admin,...)
      ContractSignature.belongsTo(models.User, {
        foreignKey: 'signer_user_id',
        as: 'signerUser',
      });
    }
  }

  ContractSignature.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_id: { type: DataTypes.BIGINT, allowNull: false },
      signer_employee_id: { type: DataTypes.STRING(255), allowNull: true },
      signer_user_id: { type: DataTypes.INTEGER, allowNull: true },
      signer_name: { type: DataTypes.STRING(255), allowNull: true },
      signer_role: {
        type: DataTypes.ENUM('employee', 'hr', 'legal', 'manager', 'representative'),
        allowNull: false,
      },
      sign_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      sign_status: {
        type: DataTypes.ENUM('pending', 'signed', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      signed_at: { type: DataTypes.DATE, allowNull: true },
      signature_evidence: { type: DataTypes.JSON, allowNull: true },
    },
    {
      sequelize,
      modelName: 'ContractSignature',
      tableName: 'contract_signatures',
      timestamps: false,
    }
  );

  return ContractSignature;
};
