import { useEffect, useState, useRef } from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import leaveApi from "../../api/leaveApi";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const ApproveLeave = () => {
  const toast = useRef<Toast>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const res = await leaveApi.getAll();
      setLeaves(res.data.data || []);
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Load thất bại" });
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      if (!user?.employee_id) return;
      if (action === "approve") {
        await leaveApi.approve(id, user.employee_id);
      } else {
        const reason = prompt("Nhập lý do từ chối:");
        await leaveApi.reject(id, user.employee_id, reason || "Không có lý do");
      }
      toast.current?.show({ severity: "success", summary: "Cập nhật thành công" });
      loadLeaves();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Lỗi khi cập nhật" });
    }
  };

  return (
    <DefaultLayout>
      <Toast ref={toast} />
      <h2 className="section-title">Duyệt Đơn Nghỉ Phép</h2>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nhân viên</th>
            <th>Phòng ban</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Lý do</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((l, i) => (
            <tr key={l.id}>
              <td>{i + 1}</td>
              <td>{l.employee?.full_name}</td>
              <td>{l.employee?.department?.value}</td>
              <td>{l.start_date}</td>
              <td>{l.end_date}</td>
              <td>{l.reason}</td>
              <td>{l.status}</td>
              <td>
                {l.status === "PENDING" && (
                  <>
                    <Button
                      label="Duyệt"
                      onClick={() => handleAction(l.id, "approve")}
                      className="p-button-success p-button-sm"
                    />
                    <Button
                      label="Từ chối"
                      onClick={() => handleAction(l.id, "reject")}
                      className="p-button-danger p-button-sm"
                    />
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DefaultLayout>
  );
};

export default ApproveLeave;
