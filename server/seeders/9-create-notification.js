'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Dữ liệu mẫu cho bảng Notifications
    const notifications = [
      {
        id: 1,
        message: 'Nhắc nhở bạn về thời gian làm việc',
        is_read: 0,
        deleted: '0',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10'),
      },
      {
        id: 2,
        message: 'Thông báo lịch họp vào ngày mai',
        is_read: 0,
        deleted: '0',
        createdAt: new Date('2023-10-11'),
        updatedAt: new Date('2023-10-11'),
      },
      {
        id: 3,
        message: 'Cập nhật mới về chính sách công ty',
        is_read: 0,
        deleted: '0',
        createdAt: new Date('2023-10-12'),
        updatedAt: new Date('2023-10-12'),
      },
      {
        id: 4,
        message: 'Thông báo nghỉ lễ vào cuối tuần này',
        is_read: 1,
        deleted: '0',
        createdAt: new Date('2023-10-13'),
        updatedAt: new Date('2023-10-13'),
      },
      {
        id: 5,
        message: 'Cập nhật về thời gian làm việc của phòng ban',
        is_read: 1,
        deleted: '0',
        createdAt: new Date('2023-10-14'),
        updatedAt: new Date('2023-10-14'),
      },
    ];

    // Chèn dữ liệu vào bảng Notifications
    await queryInterface.bulkInsert('Notifications', notifications, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa tất cả dữ liệu trong bảng Notifications khi rollback
    await queryInterface.bulkDelete('Notifications', null, {});
  },
};
