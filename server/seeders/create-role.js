'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Roles', [
      {
        code: 'role_1',
        value: 'admin',
        deleted: '0',
        createdAt: new Date(''),
        updatedAt: new Date('')
      },
      {
        code: 'role_2',
        value: 'leader',
        deleted: '0',
        createdAt: new Date(''),
        updatedAt: new Date('')
      },
      {
        code: 'role_3',
        value: 'member',
        deleted: '0',
        createdAt: new Date(''),
        updatedAt: new Date('')
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
