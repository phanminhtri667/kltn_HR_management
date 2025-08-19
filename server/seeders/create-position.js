'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Positions', [
      {
        code: 'CVGD',
        value: 'Manager',
        deleted: '0',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      },
      {
        code: 'CVLD',
        value: 'Leader',
        deleted: '0',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      },
      {
        code: 'CVMB',
        value: 'Member',
        deleted: '0',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Positions', null, {});
  }
};
