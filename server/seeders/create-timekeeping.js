"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Timekeepings", [
      {
        employee_id: 135,
        working_day: "2025-08-20",
        check_in: "08:05:00",
        check_out: "17:00:00",
        status: "On time",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        employee_id: 136,
        working_day: "2025-08-20",
        check_in: "08:25:00",
        check_out: "17:10:00",
        status: "Late",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Timekeepings", null, {});
  }
};
