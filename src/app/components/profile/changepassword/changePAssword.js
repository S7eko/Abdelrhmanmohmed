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

  const [errors, setErrors] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    api: ""
  });
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
        return "";
      case "oldPassword":
        if (!value) return "Current password is required";
        return "";
      case "newPassword":
        if (!value) return "New password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (value === formData.oldPassword) return "New password must be different";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.newPassword) return "Passwords don't match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value), api: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      email: validateField("email", formData.email),
      oldPassword: validateField("oldPassword", formData.oldPassword),
      newPassword: validateField("newPassword", formData.newPassword),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
      api: ""
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Session expired. Please login again.");

      const response = await fetch("https://skillbridge.runasp.net/api/Users/changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error response formats
        const errorMsg = data?.errors?.ConfirmPassword?.[0] ||
          data?.errors?.NewPassword?.[0] ||
          data?.title ||
          data?.message ||
          "Failed to change password. Please try again.";
        throw new Error(errorMsg);
      }

      // Success case
      Swal.fire({
        icon: "success",
        title: "Password Changed!",
        text: "Your password has been updated successfully.",
        timer: 3000,
      });

      // Reset form
      setFormData({
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error("Password change error:", error);
      setErrors(prev => ({ ...prev, api: error.message }));

      Swal.fire({
        icon: "error",
        title: "Password Change Failed",
        html: `
          <div style="text-align:left">
            <p>${error.message}</p>
            <p style="margin-top:10px;font-size:0.9em">
              <strong>Troubleshooting tips:</strong>
              <ul style="padding-left:20px;margin-top:5px">
                <li>Ensure your current password is correct</li>
                <li>Check your new password meets requirements</li>
                <li>Try again in a few minutes</li>
              </ul>
            </p>
          </div>
        `,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <h2>Change Password</h2>

      {errors.api && (
        <div className={classes.api_error}>
          <p>{errors.api}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={classes.form_group}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className={errors.email ? classes.error_input : ""}
          />
          {errors.email && <span className={classes.error_message}>{errors.email}</span>}
        </div>

        <div className={classes.form_group}>
          <label htmlFor="oldPassword">Current Password:</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className={errors.oldPassword ? classes.error_input : ""}
          />
          {errors.oldPassword && <span className={classes.error_message}>{errors.oldPassword}</span>}
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
            minLength="8"
            autoComplete="new-password"
            className={errors.newPassword ? classes.error_input : ""}
          />
          {errors.newPassword ? (
            <span className={classes.error_message}>{errors.newPassword}</span>
          ) : (
            <small className={classes.hint}>Minimum 8 characters</small>
          )}
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
            minLength="8"
            autoComplete="new-password"
            className={errors.confirmPassword ? classes.error_input : ""}
          />
          {errors.confirmPassword && (
            <span className={classes.error_message}>{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className={classes.button}
          disabled={loading}
        >
          {loading ? (
            <span className={classes.button_loading}>
              <span className={classes.spinner}></span>
              Processing...
            </span>
          ) : (
            "Change Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;