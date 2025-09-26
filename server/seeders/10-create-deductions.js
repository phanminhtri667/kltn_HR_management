"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("deductions", [
      { id: 1, code: "DED_TAX", name: "Thuế TNCN", percent: 10.0 },
      { id: 2, code: "DED_INSURANCE", name: "Bảo hiểm xã hội", percent: 5.0 },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("deductions", null, {});
  },
};
