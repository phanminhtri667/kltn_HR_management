import { useEffect, useState } from "react";
import axios from "../../services/axios";

export default function LeavePage() {
  const [form, setForm] = useState({ type: "", startDate: "", endDate: "", reason: "" });
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await axios.get("/api/leave-request/my");
    setRequests(res.data.data);
  };

  const submit = async () => {
    await axios.post("/api/leave-request", form);
    fetchRequests();
  };

  useEffect(() => { fetchRequests(); }, []);

  return (
    <div>
      <h2>Đơn xin nghỉ</h2>
      <input type="text" placeholder="Loại nghỉ" onChange={e => setForm({ ...form, type: e.target.value })} />
      <input type="date" onChange={e => setForm({ ...form, startDate: e.target.value })} />
      <input type="date" onChange={e => setForm({ ...form, endDate: e.target.value })} />
      <textarea placeholder="Lý do" onChange={e => setForm({ ...form, reason: e.target.value })}></textarea>
      <button onClick={submit}>Gửi đơn</button>

      <ul>
        {requests.map((r: any) => (
          <li key={r.id}>{r.startDate} → {r.endDate} ({r.status})</li>
        ))}
      </ul>
    </div>
  );
}
