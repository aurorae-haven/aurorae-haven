import React, { useEffect } from "react";

function Toast({ message, visible, onClose }) {
  useEffect(() => {
    if (visible && message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3800);
      return () => clearTimeout(timer);
    }
  }, [visible, message, onClose]);

  if (!visible || !message) return null;

  return (
    <div id="toast" className="toast" style={{ display: "block" }}>
      {message}
    </div>
  );
}

export default Toast;
