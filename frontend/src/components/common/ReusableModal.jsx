// components/common/ReusableModal.jsx
import React from "react";
import { Modal } from "react-bootstrap"; // if you're using react-bootstrap

const ReusableModal = ({ show, onClose, title, children, size = "md" }) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size={size}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default ReusableModal;
