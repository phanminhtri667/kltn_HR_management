'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Departments', [
      {
        code: 'PBNS',
        value: 'Nhân sự',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PBKT',
        value: 'Kế toán',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PBKD',
        value: 'Kinh doanh',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Departments', null, {});
  }
};
