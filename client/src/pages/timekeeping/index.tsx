import { useEffect, useState } from "react";
import axios from "../../services/axios";

export default function TimekeepingPage() {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");

  const fetchRecords = async () => {
    const res = await axios.get("/api/timekeeping/my");
    setRecords(res.data.data);
  };

  const clockIn = async () => {
    const res = await axios.post("/api/timekeeping/clock-in");
    setMessage(res.data.message);
    fetchRecords();
  };

  const clockOut = async () => {
    const res = await axios.post("/api/timekeeping/clock-out");
    setMessage(res.data.message);
    fetchRecords();
  };

  useEffect(() => { fetchRecords(); }, []);

  return (
    <div>
      <h2>Chấm công</h2>
      <button onClick={clockIn}>Chấm công vào</button>
      <button onClick={clockOut}>Chấm công ra</button>
      <p>{message}</p>
      <ul>
        {records.map((r: any) => (
          <li key={r.id}>{r.date}: {r.clockInAt} - {r.clockOutAt}</li>
        ))}
      </ul>
    </div>
  );
}
