"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("public_holidays", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      holiday_date: { type: Sequelize.DATEONLY, allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("public_holidays");
  },
};
