'use strict';
const removeDiacritics = require('remove-diacritics');
let dataMock = [];
let firstNames = ['Hồng', 'Hà', 'Khánh', 'Linh', 'Thảo', 'Phương', 'Tâm', 'Quỳnh', 'Dương', 'Tú', 'Khuê'];
let lastNames = ['Nguyễn Thanh', 'Trần Thanh', 'Lê Đức', 'Phạm Thị', 'Hoàng Văn', 'Đặng Thị', 'Vũ Văn', 'Bùi Thị', 'Ngô Văn', 'Mai Thị', 'Nguyễn Thị', 'Lê Ngọc', 'Đào Ngọc'];

for (let i = 5; i < 20; i++) {

  let firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  let lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  let email = removeDiacritics(firstName + lastName.split(' ')[0]) + '@gmail.com';
  let item = {
    employee_id: 'AD' + i.toString().padStart(4, '0'),
    full_name: lastName + ' ' + firstName,
    first_name: firstName,
    phone: '0123445556',
    email: email,
    gender: lastName.includes('Thị') || firstName.includes('Ngọc') ? 'female' : 'male',
    dayOfBirth: new Date('05-05-1990'),
    department_id: 'PBKD',
    position_id: 'CVMB',
    deleted: '0',
    createdAt: new Date('10-10-2023'),
    updatedAt: new Date('10-10-2023')
  };

  dataMock.push(item);
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Employees', [
      {
        employee_id: 'AD0001',
        full_name: 'Trương Minh Tâm',
        first_name: 'Tâm',
        phone: '0123445556',
        email: 'tamtm@gmail.com',
        gender: 'male',
        dayOfBirth: new Date('05-05-1990'),
        department_id: 'PBNS',
        position_id: 'CVLD',
        deleted: '0',
        createdAt: new Date('10-10-2023'),
        updatedAt: new Date('10-10-2023')
      },
      {
        employee_id: 'AD0002',
        full_name: 'Trương Huỳnh Anh Thông',
        first_name: 'Thông',
        phone: '0925578467',
        email: 'thongtha@gmail.com',
        gender: 'male',
        dayOfBirth: new Date('05-05-1990'),
        department_id: 'PBNS',
        position_id: 'CVMB',
        deleted: '0',
        createdAt: new Date('10-10-2023'),
        updatedAt: new Date('10-10-2023')
      },
      {
        employee_id: 'AD0003',
        full_name: 'Đinh Hoàng Vũ',
        first_name: 'Vũ',
        phone: '0897784876',
        email: 'vudh@gmail.com',
        gender: 'male',
        dayOfBirth: new Date('05-05-1990'),
        department_id: 'PBNS',
        position_id: 'CVMB',
        deleted: '0',
        createdAt: new Date('10-10-2023'),
        updatedAt: new Date('10-10-2023')
      },
      {
        employee_id: 'AD0004',
        full_name: 'Phan Đình Trung',
        first_name: 'Trung',
        phone: '0425598648',
        email: 'trungpd@gmail.com',
        gender: 'male',
        dayOfBirth: new Date('05-05-1990'),
        department_id: 'PBNS',
        position_id: 'CVMB',
        deleted: '0',
        createdAt: new Date('10-10-2023'),
        updatedAt: new Date('10-10-2023')
      },

    ].concat(dataMock), {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Employees', null, {});
  }
};
