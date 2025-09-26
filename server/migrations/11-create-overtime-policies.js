"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("overtime_policies", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: Sequelize.STRING(50), allowNull: false },
      day_type: {
        type: Sequelize.ENUM("weekday", "weekend", "holiday"),
        allowNull: false,
      },
      multiplier: { type: Sequelize.DECIMAL(4, 2), allowNull: false },
      start_time: { type: Sequelize.TIME, allowNull: false },
      end_time: { type: Sequelize.TIME, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("overtime_policies");
  },
};
