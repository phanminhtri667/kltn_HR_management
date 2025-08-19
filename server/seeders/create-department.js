'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Departments', [
      {
        code: 'PBNS',
        value: 'Nhân sự',
        deleted: '0',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      },
      {
        code: 'PBKT',
        value: 'Kế toán',
        deleted: '0',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      },
      {
        code: 'PBKD',
        value: 'Kinh doanh',
        deleted: '0',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Departments', null, {});
  }
};
