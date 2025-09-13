import './timekeeping.scss';
import DefaultLayout from '../../layouts/DefaultLayout';
import { Card } from 'primereact/card';
import { useEffect, useRef, useState } from 'react';
import workingHoursApi from '../../api/workingHoursApi';
import timekeepingApi from '../../api/timekeepingApi';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const Timekeeping = () => {
  const [workingHours, setWorkingHours] = useState<any>(null);
  const [timekeepingData, setTimekeepingData] = useState<any[]>([]);
  const toast = useRef<Toast | null>(null);

  useEffect(() => {
    getWorkingHours();
    getTimekeeping();
  }, []);

  const getWorkingHours = async () => {
    try {
      const res = await workingHoursApi.get();
      setWorkingHours(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getTimekeeping = async () => {
    try {
      const res = await timekeepingApi.getAll();
      setTimekeepingData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateWorkingHours = async () => {
    try {
      if (workingHours) {
        await workingHoursApi.update(workingHours);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Working hours updated successfully',
        });
        getWorkingHours();
      }
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update working hours',
      });
    }
  };

  return (
    <DefaultLayout>
      <Toast ref={toast} />

      {/* Working hours config */}
      <h2 className="section-title">Working Hours</h2>
<Card className="form-card">
  {workingHours && (
    <div className="form-inline">
      <div className="form-group">
        <label>Start Time</label>
        <InputText
          type="time"
          value={workingHours.start_time}
          onChange={(e) =>
            setWorkingHours({ ...workingHours, start_time: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>End Time</label>
        <InputText
          type="time"
          value={workingHours.end_time}
          onChange={(e) =>
            setWorkingHours({ ...workingHours, end_time: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Grace Period (minutes)</label>
        <InputText
          type="number"
          value={workingHours.grace_period}
          onChange={(e) =>
            setWorkingHours({
              ...workingHours,
              grace_period: Number(e.target.value),
            })
          }
        />
      </div>

      <div className="btn-container">
        <Button
          label="Update"
          onClick={handleUpdateWorkingHours}
          className="btn-update"
        />
      </div>
    </div>
  )}
</Card>


      {/* Timekeeping table */}
      <h2 style={{ marginTop: '40px' }}>Employee Timekeeping</h2>
      <div className="employee-table">
        <Card>
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {timekeepingData.map((item, index) => (
                <tr key={index}>
                  <td>{item.employee?.employee_id}</td>
                  <td>{item.employee?.full_name}</td>
                  <td>{item.work_date}</td>
                  <td>{item.check_in || '-'}</td>
                  <td>{item.check_out || '-'}</td>
                  <td>{item.total_hours || 0}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default Timekeeping;
