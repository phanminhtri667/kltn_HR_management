import { Model, DataTypes, Optional } from 'sequelize';

interface EmploymentContractAttrs {
  id: number;
  contract_code: string;
  employee_id: string;
  department_id?: number | null;
  position_id?: number | null;
  template_id?: number | null;
  legal_entity_id?: number | null;                 // NEW

  contract_type: 'fixed_term' | 'indefinite' | 'probation' | 'part_time' | 'contractor';
  job_title?: string | null;
  work_location?: string | null;
  start_date: Date;
  end_date?: Date | null;
  probation_end_date?: Date | null;

  base_salary: string; // DECIMAL as string
  currency: string;
  pay_frequency: 'monthly' | 'biweekly' | 'weekly';
  sign_method?: 'digital' | 'wet' | 'none' | null;
  status:
  | 'draft'
  | 'sent_for_signing'
  | 'signed'
  | 'active'
  | 'amended'
  | 'terminated'
  | 'expired'
  | 'cancel'
  | 'finalized';
  signed_at?: Date | null;
  activated_at?: Date | null;
  terminated_at?: Date | null;

  // NEW: snapshot bank + SLA + reason
  bank_account_name?: string | null;               // NEW
  bank_account_number?: string | null;             // NEW
  bank_name?: string | null;                       // NEW
  status_at?: Date | null;                       // NEW
  sent_for_signing_at?: Date | null;               // NEW
  status_reason?: string | null;               // NEW

  created_by?: number | null;
  updated_by?: number | null;
  created_by_employee_id?: string | null;   // NEW
  updated_by_employee_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type EmploymentContractCreation = Optional<
  EmploymentContractAttrs,
  | 'id'
  | 'department_id'
  | 'position_id'
  | 'template_id'
  | 'legal_entity_id'          // NEW
  | 'job_title'
  | 'work_location'
  | 'end_date'
  | 'probation_end_date'
  | 'sign_method'
  | 'signed_at'
  | 'activated_at'
  | 'terminated_at'
  | 'bank_account_name'
  | 'bank_account_number'
  | 'bank_name'           
  | 'status_at'                       
  | 'sent_for_signing_at'      // NEW
  | 'status_reason'        // NEW
  | 'created_by'
  | 'updated_by'
  | 'created_by_employee_id'   // NEW
  | 'updated_by_employee_id'   // NEW
  | 'created_at'
  | 'updated_at'
>;

module.exports = (sequelize: any) => {
  class EmploymentContract
    extends Model<EmploymentContractAttrs, EmploymentContractCreation>
    implements EmploymentContractAttrs
  {
    public id!: number;
    public contract_code!: string;
    public employee_id!: string;
    public department_id!: number | null;
    public position_id!: number | null;
    public template_id!: number | null;
    public legal_entity_id!: number | null;              // NEW

    public contract_type!: EmploymentContractAttrs['contract_type'];
    public job_title!: string | null;
    public work_location!: string | null;
    public start_date!: Date;
    public end_date!: Date | null;
    public probation_end_date!: Date | null;

    public base_salary!: string;
    public currency!: string;
    public pay_frequency!: EmploymentContractAttrs['pay_frequency'];
    public sign_method!: EmploymentContractAttrs['sign_method'];

    public status!: EmploymentContractAttrs['status'];
    public signed_at!: Date | null;
    public activated_at!: Date | null;
    public terminated_at!: Date | null;

    public bank_account_name!: string | null;           // NEW
    public bank_account_number!: string | null;         // NEW
    public bank_name!: string | null;                   // NEW
    public status_at!: Date | null;                   // NEW
    public sent_for_signing_at!: Date | null;           // NEW
    public status_reason!: string | null;           // NEW

    public created_by!: number | null;
    public updated_by!: number | null;
    public created_by_employee_id!: string | null;  // NEW
    public updated_by_employee_id!: string | null;  // NEW
    public created_at!: Date;
    public updated_at!: Date;

    static associate(models: any) {
      EmploymentContract.belongsTo(models.Employee,        { foreignKey: 'employee_id', targetKey: 'employee_id', as: 'employee' });
      EmploymentContract.belongsTo(models.Department,      { foreignKey: 'department_id', as: 'department' });
      EmploymentContract.belongsTo(models.Position,        { foreignKey: 'position_id', as: 'position' });
      EmploymentContract.belongsTo(models.ContractTemplate,{ foreignKey: 'template_id', as: 'template', onDelete: 'SET NULL' });

      // NEW: liên kết pháp nhân (Bên A)
      EmploymentContract.belongsTo(models.LegalEntity,     { foreignKey: 'legal_entity_id', as: 'company', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

      EmploymentContract.hasMany(models.ContractVersion,   { foreignKey: 'contract_id', as: 'versions', onDelete: 'CASCADE' });
      EmploymentContract.hasMany(models.ContractSignature, { foreignKey: 'contract_id', as: 'signatures', onDelete: 'CASCADE' });
      EmploymentContract.hasMany(models.ContractAmendment, { foreignKey: 'contract_id', as: 'amendments', onDelete: 'CASCADE' });
      EmploymentContract.hasMany(models.ContractAttachment,{ foreignKey: 'contract_id', as: 'attachments', onDelete: 'CASCADE' });
      EmploymentContract.hasMany(models.ContractAudit,     { foreignKey: 'contract_id', as: 'audits', onDelete: 'CASCADE' });
      EmploymentContract.hasMany(models.ContractWorkingHours,   { foreignKey: 'contract_id', as: 'contractWorkingHours',   onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      EmploymentContract.hasMany(models.ContractAllowance,      { foreignKey: 'contract_id', as: 'contractAllowances',     onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      EmploymentContract.hasMany(models.ContractDeduction,      { foreignKey: 'contract_id', as: 'contractDeductions',     onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      EmploymentContract.hasMany(models.ContractOvertimePolicy, { foreignKey: 'contract_id', as: 'contractOTPolicies',     onDelete: 'CASCADE', onUpdate: 'CASCADE' });

    }
  }

  EmploymentContract.init(
    {
      id:                { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      contract_code:     { type: DataTypes.STRING(50), allowNull: false, unique: true },
      employee_id:       { type: DataTypes.STRING(255), allowNull: false },
      department_id:     { type: DataTypes.INTEGER, allowNull: true },
      position_id:       { type: DataTypes.INTEGER, allowNull: true },
      template_id:       { type: DataTypes.BIGINT, allowNull: true },
      legal_entity_id:   { type: DataTypes.BIGINT, allowNull: true },       // NEW

      contract_type:     { type: DataTypes.ENUM('fixed_term','indefinite','probation','part_time','contractor'), allowNull: false },
      job_title:         { type: DataTypes.STRING(255), allowNull: true },
      work_location:     { type: DataTypes.STRING(255), allowNull: true },
      start_date:        { type: DataTypes.DATEONLY, allowNull: false },
      end_date:          { type: DataTypes.DATEONLY, allowNull: true },
      probation_end_date:{ type: DataTypes.DATEONLY, allowNull: true },

      base_salary:       { type: DataTypes.DECIMAL(12,2), allowNull: false },
      currency:          { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'VND' },
      pay_frequency:     { type: DataTypes.ENUM('monthly','biweekly','weekly'), allowNull: false, defaultValue: 'monthly' },
      sign_method:       { type: DataTypes.ENUM('digital','wet','none'), allowNull: true, defaultValue: 'none' },
      status: {
        type: DataTypes.ENUM(
          'draft',
          'sent_for_signing',
          'signed',
          'active',
          'amended',
          'terminated',
          'expired',
          'cancel',
          'finalized'
        ),
        allowNull: false,
        defaultValue: 'draft'
      },
      signed_at:         { type: DataTypes.DATE, allowNull: true },
      activated_at:      { type: DataTypes.DATE, allowNull: true },
      terminated_at:     { type: DataTypes.DATE, allowNull: true },

      bank_account_name:   { type: DataTypes.STRING(100), allowNull: true }, // NEW
      bank_account_number: { type: DataTypes.STRING(50),  allowNull: true }, // NEW
      bank_name:           { type: DataTypes.STRING(100), allowNull: true }, // NEW
      status_at:         { type: DataTypes.DATE, allowNull: true },        // NEW
      sent_for_signing_at: { type: DataTypes.DATE, allowNull: true },        // NEW
      status_reason:   { type: DataTypes.STRING(500), allowNull: true }, // NEW

      created_by:        { type: DataTypes.INTEGER, allowNull: true },
      updated_by:        { type: DataTypes.INTEGER, allowNull: true },
      created_by_employee_id:  { type: DataTypes.STRING(64), allowNull: true },  // NEW
      updated_by_employee_id:  { type: DataTypes.STRING(64), allowNull: true },  // NEW
      created_at:        { type: DataTypes.DATE },
      updated_at:        { type: DataTypes.DATE }
    },
    { sequelize, modelName: 'EmploymentContract', tableName: 'employment_contracts', timestamps: false }
  );

  return EmploymentContract;
};
