"use client";
import React, { useState } from "react";
import classes from "./changeEmail.module.css";

const ChangeEmail = () => {
  const [formData, setFormData] = useState({
    oldEmail: "",
    newEmail: "",
    confirmEmail: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (formData.newEmail !== formData.confirmEmail) {
      setError("New email and confirm email do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage
      const response = await fetch("https://skillbridge.runasp.net/api/Users/changeEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the request
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change email.");
      }

      setSuccess("Email changed successfully!");
      setError("");
      setFormData({
        oldEmail: "",
        newEmail: "",
        confirmEmail: "",
        password: "",
      });
    } catch (error) {
      setError(error.message);
      setSuccess("");
    }
  };

  return (
    <div className={classes.container}>
      <h2>Change Email</h2>
      {error && <p className={classes.error} style={{ color: "red" }}>{error}</p>}
      {success && <p className={classes.success} style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className={classes.form_group}>
          <label htmlFor="oldEmail">Old Email:</label>
          <input
            type="email"
            id="oldEmail"
            name="oldEmail"
            value={formData.oldEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div className={classes.form_group}>
          <label htmlFor="newEmail">New Email:</label>
          <input
            type="email"
            id="newEmail"
            name="newEmail"
            value={formData.newEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div className={classes.form_group}>
          <label htmlFor="confirmEmail">Confirm New Email:</label>
          <input
            type="email"
            id="confirmEmail"
            name="confirmEmail"
            value={formData.confirmEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div className={classes.form_group}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button className={classes.button} type="submit">Change Email</button>
      </form>
    </div>
  );
};

export default ChangeEmail;