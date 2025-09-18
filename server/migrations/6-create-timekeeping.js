"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Timekeeping", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      employee_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Employees",
          key: "employee_id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      work_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      check_in: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      check_out: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      total_hours: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "On time"
      },
      department_id: {  // Thêm cột department_id
        type: Sequelize.INTEGER,
        allowNull: true, // Để cho phép null vì có thể một số bản ghi không có department_id
        references: {
          model: "Departments",  // Liên kết với bảng Departments
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",  // Nếu phòng ban bị xóa, set null cho nhân viên
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Timekeeping");
  }
};
