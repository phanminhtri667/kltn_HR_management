"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("allowances", [
      { id: 1, code: "ALW_MEAL", name: "Phụ cấp ăn trưa", amount: 500000.0 },
      { id: 2, code: "ALW_TRANSPORT", name: "Phụ cấp đi lại", amount: 300000.0 },
      { id: 3, code: "ALW_HOUSING", name: "Phụ cấp nhà ở", amount: 1000000.0 },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("allowances", null, {});
  },
};
