"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payroll_payslip_lines", {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      employee_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: "Employees", key: "employee_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      total_work_hours: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0.0 },
      absent_days: { type: Sequelize.INTEGER, defaultValue: 0 },
      actual_salary: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0.0 },
      ot_weekday_hours: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0.0 },
      ot_weekend_hours: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0.0 },
      ot_holiday_hours: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0.0 },
      overtime_amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0.0 },
      allowance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0.0 },
      total_amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0.0 },
      deduction: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0.0 },
      received_salary: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0.0 },
      month: { type: Sequelize.STRING(7), allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("payroll_payslip_lines");
  },
};
