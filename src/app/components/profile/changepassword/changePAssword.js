"use client";
import React, { useState } from "react";
import classes from "./changePassword.module.css";
import Swal from "sweetalert2";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // حالة التحميل

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من تطابق كلمة المرور الجديدة وتأكيدها
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    // التحقق من أن جميع الحقول مملوءة
    if (
      !formData.email ||
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true); // بدء التحميل
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token"); // استخراج الـ token من localStorage
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Unauthorized",
          text: "Please login first 🔑",
        });
        return;
      }

      // تحضير البيانات المرسلة (بدون confirmPassword)
      const payload = {
        email: formData.email,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      };

      const response = await fetch(
        "http://skillbridge.runasp.net/api/Users/changePassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // إضافة الـ token إلى الـ headers
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to change password.");
      }

      setSuccess("Password changed successfully!");
      setFormData({
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Password changed successfully! ✅",
      });
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to change password. ❌",
      });
    } finally {
      setLoading(false); // إيقاف التحميل
    }
  };

  return (
    <div className={classes.container}>
      <h2>Change Password</h2>
      {error && <p className={classes.error}>{error}</p>}
      {success && <p className={classes.success}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className={classes.form_group}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className={classes.form_group}>
          <label htmlFor="oldPassword">Old Password:</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className={classes.form_group}>
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className={classes.form_group}>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button
          className={classes.button}
          type="submit"
          disabled={loading} // تعطيل الزر أثناء التحميل
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;