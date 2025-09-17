"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      role_code: {
        type: Sequelize.STRING, defaultValue: 'role_3'
      },
      department_id: {  // Thêm department_id
        type: Sequelize.INTEGER,
        allowNull: true, // Trường này có thể là NULL nếu không có phòng ban cho người dùng
        references: {
          model: 'Departments', // Liên kết với bảng Departments
          key: 'id',
        },
      },
      deleted: {
        type: Sequelize.STRING,defaultValue : '0' 
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
