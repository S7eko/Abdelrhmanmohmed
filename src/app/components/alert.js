"use client"; // تأكد من أن هذا الكود يعمل في الـ Client Side

import React from "react";
import Swal from "sweetalert2";

const AlertButton = () => {
  const showAlert = () => {
    Swal.fire({
      title: "Good job!",
      text: "You clicked the button!",
      icon: "success",
    });
  };

  return (
    <button onClick={showAlert} style={styles.button}>
      Click Me
    </button>
  );
};

// بعض الأنماط البسيطة للأزرار
const styles = {
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#28a745",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AlertButton;
