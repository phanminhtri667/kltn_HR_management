"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Employees", {
      employee_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true, // theo SQL gốc chỉ có employee_id làm PK
      },
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      phone: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      gender: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: "Male",
      },
      dayOfBirth: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      // thêm password
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      // thêm role_code
      role_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "role_3",
      },
      // thêm basic_salary
      basic_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      deleted: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: "0",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      department_id: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
        references: {
          model: "Departments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      position_id: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
        references: {
          model: "Positions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Employees");
  },
};
