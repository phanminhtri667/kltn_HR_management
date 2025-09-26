"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Timekeeping", [
      {
        employee_id: 'AD0001',                  // phải tồn tại trong Employees.employee_id
        work_date: new Date("2025-08-11"),
        check_in: "08:01:00",
        check_out: "17:00:00",
        total_hours: 8.98,
        status: "On time",
        created_at: new Date(),
        updated_at: new Date(),
        ot_weekday_hours: 1.0,
        ot_weekend_hours: 0.0,
        ot_holiday_hours: 0.0
      },
      {
        employee_id: 'AD0002',                  // phải tồn tại trong Employees.employee_id
        work_date: new Date("2025-08-10"),
        check_in: "08:05:00",
        check_out: "17:02:00",
        total_hours: 8.95,
        status: "On time",
        created_at: new Date(),
        updated_at: new Date(),
        ot_weekday_hours: 0.0,
        ot_weekend_hours: 0.0,
        ot_holiday_hours: 0.0
      },
      {
        employee_id: 'AD0003',                  // phải tồn tại trong Employees.employee_id
        work_date: new Date("2025-08-27"),
        check_in: "08:05:00",
        check_out: "17:05:00",
        total_hours: 9.00,
        status: "On time",
        created_at: new Date(),
        updated_at: new Date(),
        ot_weekday_hours: 0.0,
        ot_weekend_hours: 0.0,
        ot_holiday_hours: 0.0
      },
      {
        employee_id: 'AD0004',                  // phải tồn tại trong Employees.employee_id
        work_date: new Date("2025-08-27"),
        check_in: "08:25:00",
        check_out: "17:10:00",
        total_hours: 8.75,
        status: "Late",
        created_at: new Date(),
        updated_at: new Date(),
        ot_weekday_hours: 0.0,
        ot_weekend_hours: 0.0,
        ot_holiday_hours: 0.0
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Timekeeping", null, {});
  }
};

