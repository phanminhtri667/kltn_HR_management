"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("public_holidays", [
      { id: 1, holiday_date: "2025-09-20", name: "Ngày đầu tiên" },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("public_holidays", null, {});
  },
};
