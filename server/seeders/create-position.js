'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Positions', [
      {
        code: 'CVGD',
        value: 'Manager',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CVLD',
        value: 'Leader',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CVMB',
        value: 'Member',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Positions', null, {});
  }
};
