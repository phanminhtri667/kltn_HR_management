import React, { useEffect, useState } from "react";
import axios from "axios";

const ApproveLeave = () => {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  useEffect(() => {
    // Lấy danh sách đơn nghỉ phép chưa duyệt từ API
    axios.get('/api/leave-request')
      .then(response => {
        setLeaveRequests(response.data.data);
      })
      .catch(error => {
        console.log('Error fetching leave requests', error);
      });
  }, []);

  const handleApprove = (id: number) => {
    axios.patch(`/api/leave-request/${id}/approve`)
      .then(response => {
        alert('Đơn nghỉ phép đã được duyệt');
        // Cập nhật lại danh sách đơn nghỉ phép
        setLeaveRequests(prevRequests => prevRequests.filter(request => request.id !== id));
      })
      .catch(error => {
        console.log('Error approving leave request', error);
      });
  };

  return (
    <div>
      <h1>Duyệt đơn nghỉ phép</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map(request => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{request.user.name}</td>
              <td>{request.startDate}</td>
              <td>{request.endDate}</td>
              <td>{request.reason}</td>
              <td>
                <button onClick={() => handleApprove(request.id)}>Duyệt</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApproveLeave;
