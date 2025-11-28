import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

interface Props {
  visible: boolean;
  onHide: () => void;
  onSubmit: (reason: string) => void;
  title?: string;
}

const CancelReasonModal: React.FC<Props> = ({ visible, onHide, onSubmit, title }) => {
  const [reason, setReason] = useState("");

  return (
    <Dialog
      header={title || "Nhập lý do"}
      visible={visible}
      style={{ width: "30rem" }}
      modal
      onHide={onHide}
    >
      <div className="flex flex-column gap-3">
        <label className="font-semibold">Lý do:</label>
        <InputTextarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          autoFocus
          placeholder="Nhập lý do hủy/chấm dứt hợp đồng..."
        />

        <div className="flex justify-end gap-2 mt-3">
          <Button label="Hủy" className="p-button-secondary" onClick={onHide} />
          <Button
            label="Xác nhận"
            disabled={!reason.trim()}
            onClick={() => {
              onSubmit(reason.trim());
              setReason("");
            }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default CancelReasonModal;
