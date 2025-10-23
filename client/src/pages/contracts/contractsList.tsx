import React from "react";

interface ContractsListProps {
  data: any[];
  onView: (id: number) => void;
}

const ContractsList: React.FC<ContractsListProps> = ({ data, onView }) => {
  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-auto">
      <table className="table" style={{ minWidth: 700 }}>
        <thead>
          <tr>
            <th style={{ width: 80 }}>ID</th>
            <th>Contract Code / Name</th>
            <th>Status</th>
            <th style={{ width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((c: any) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.contract_code || c.name || "-"}</td>
                <td>{c.status}</td>
                <td>
                  <button
                    className="p-button p-button-sm"
                    onClick={() => onView(Number(c.id))}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContractsList;
