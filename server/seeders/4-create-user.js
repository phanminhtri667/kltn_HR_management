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
        department_id: null, // admin không thuộc phòng ban
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Phạm Văn Leader',
        email: 'leader@gmail.com',
        password: hashPassword,
        role_code: 'role_2', // leader
        department_id: 1, // leader quản lý phòng ban id=1
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Nguyễn Văn Member',
        email: 'member1@gmail.com',
        password: hashPassword,
        role_code: 'role_3', // member
        department_id: 1, // member thuộc phòng ban id=1
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //
      {
        name: 'Leader nguyễn',
        email: 'leader2@gmail.com',
        password: hashPassword,
        role_code: 'role_2', // leader
        department_id: 2, // leader quản lý phòng ban id=2
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Member 2',
        email: 'member2@gmail.com',
        password: hashPassword,
        role_code: 'role_3', // member
        department_id: 2, // member thuộc phòng ban id=2
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      //
      {
        name: 'Leader 3',
        email: 'leader3@gmail.com',
        password: hashPassword,
        role_code: 'role_2', // leader
        department_id: 3, // leader quản lý phòng ban id=3
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Member 3',
        email: 'member3@gmail.com',
        password: hashPassword,
        role_code: 'role_3', // member
        department_id: 3, // member thuộc phòng ban id=1
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