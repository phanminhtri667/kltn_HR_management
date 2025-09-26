"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("overtime_policies", [
      { id: 3, code: "OT_HOLIDAY", day_type: "holiday", multiplier: 3.0, start_time: "00:00:00", end_time: "23:59:59" },
      { id: 1, code: "OT_WEEKDAY", day_type: "weekday", multiplier: 1.5, start_time: "18:00:00", end_time: "23:59:59" },
      { id: 2, code: "OT_WEEKEND", day_type: "weekend", multiplier: 2.0, start_time: "00:00:00", end_time: "23:59:59" },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("overtime_policies", null, {});
  },
};
