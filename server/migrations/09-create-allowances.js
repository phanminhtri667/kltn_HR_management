"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("allowances", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: Sequelize.STRING(50), allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("allowances");
  },
};
