import { Model, DataTypes, Optional } from 'sequelize';

export interface LegalEntityAttrs {
  id: number;
  company_name: string;
  tax_code: string;
  address: string;
  representative_name: string;
  representative_title: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  created_at?: Date;
  updated_at?: Date;
}
type LegalEntityCreation = Optional<
  LegalEntityAttrs,
  'id' | 'contact_phone' | 'contact_email' | 'created_at' | 'updated_at'
>;

module.exports = (sequelize: any) => {
  class LegalEntity
    extends Model<LegalEntityAttrs, LegalEntityCreation>
    implements LegalEntityAttrs
  {
    public id!: number;
    public company_name!: string;
    public tax_code!: string;
    public address!: string;
    public representative_name!: string;
    public representative_title!: string;
    public contact_phone!: string | null;
    public contact_email!: string | null;
    public created_at!: Date;
    public updated_at!: Date;

    static associate(models: any) {
      LegalEntity.hasMany(models.EmploymentContract, {
        foreignKey: 'legal_entity_id',
        as: 'contracts',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  LegalEntity.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      company_name: { type: DataTypes.STRING(255), allowNull: false },
      tax_code: { type: DataTypes.STRING(50), allowNull: false },
      address: { type: DataTypes.TEXT, allowNull: false },
      representative_name: { type: DataTypes.STRING(100), allowNull: false },
      representative_title: { type: DataTypes.STRING(100), allowNull: false },
      contact_phone: { type: DataTypes.STRING(20), allowNull: true },
      contact_email: { type: DataTypes.STRING(100), allowNull: true },
      created_at: { type: DataTypes.DATE },
      updated_at: { type: DataTypes.DATE },
    },
    { sequelize, modelName: 'LegalEntity', tableName: 'legal_entities', timestamps: false }
  );

  return LegalEntity;
};
