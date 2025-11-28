import { useEffect, useState, useRef } from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import leaveApi from "../../api/leaveApi";

const LeaveList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [leaves, setLeaves] = useState<any[]>([]);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (user?.employee_id) loadMyLeaves();
  }, [user]);

  const loadMyLeaves = async () => {
    try {
      const res = await leaveApi.getMyLeaves(user.employee_id);
      setLeaves(res.data.data || []);
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Load thất bại" });
    }
  };

  return (
    <DefaultLayout>
      <Toast ref={toast} />
      <h2 className="section-title">Lịch sử đơn nghỉ phép</h2>
      <Card>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Lý do</th>
              <th>Loại nghỉ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length ? (
              leaves.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.start_date}</td>
                  <td>{item.end_date}</td>
                  <td>{item.reason}</td>
                  <td>{item.leave_type?.name || "-"}</td>
                  <td>
                    <span
                      className={`status-badge ${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  Không có đơn nghỉ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </DefaultLayout>
  );
};

export default LeaveList;
