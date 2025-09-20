"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("working_hours", [
      {
        start_time: "08:00:00",
        end_time: "17:00:00",
        grace_period: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        start_time: "09:00:00",
        end_time: "18:00:00",
        grace_period: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("working_hours", null, {});
  },
};
