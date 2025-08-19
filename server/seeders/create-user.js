'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashPassword = await bcrypt.hashSync('123', bcrypt.genSaltSync(3));
    await queryInterface.bulkInsert('Users', [
      {
        name: 'admin',
        email: 'admin@gmail.com',
        password: hashPassword,
        role_code: 'role_1',
        deleted: '0',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      },
      {
        name: 'Phạm Văn Leader',
        email: 'leader@gmail.com',
        password: hashPassword,
        role_code: 'role_2', // leader
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Nguyễn Văn Member',
        email: 'member1@gmail.com',
        password: hashPassword,
        role_code: 'role_3', // member
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
