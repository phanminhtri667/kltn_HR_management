'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existing = await queryInterface.sequelize.query(
      `SELECT code FROM Departments`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingCodes = new Set(existing.map(item => item.code));

    const departments = [
      { code: 'PBNS', value: 'Nhân sự' },
      { code: 'PBKT', value: 'Kế toán' },
      { code: 'PBKD', value: 'Kinh doanh' }
    ];

    const newDepartments = departments
      .filter(d => !existingCodes.has(d.code))
      .map(d => ({
        ...d,
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    if (newDepartments.length > 0) {
      await queryInterface.bulkInsert('Departments', newDepartments, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Departments', null, {});
  }
};
