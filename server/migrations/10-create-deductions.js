"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("deductions", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: Sequelize.STRING(50), allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
      percent: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("deductions");
  },
};
