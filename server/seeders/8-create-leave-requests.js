"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("LeaveRequests", [
      {
        employee_id: 137,
        start_date: "2025-08-25",
        end_date: "2025-08-27",
        reason: "Nghỉ phép đi du lịch",
        status: "Pending",
        approver_id: 135,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        employee_id: 136,
        start_date: "2025-08-22",
        end_date: "2025-08-22",
        reason: "Nghỉ bệnh",
        status: "Approved",
        approver_id: 135,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("LeaveRequests", null, {});
  }
};
