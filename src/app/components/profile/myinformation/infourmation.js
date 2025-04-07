"use client";
import React, { useState, useEffect } from "react";
import classes from "./infourmation.module.css"; // Import CSS module

const Information = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        if (!token) {
          throw new Error("Please login first.");
        }

        const response = await fetch(
          "https://skillbridge.runasp.net/api/Users/currentUser",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return <p>Loading user information...</p>;
  }

  if (error) {
    return <p className={classes.error}>{error}</p>;
  }

  return (
    <div className={classes.container}>
      <h2>My Information</h2>
      {user ? (
        <div className={classes.user_info}>
          <div className={classes.user_image}>
            <img
              src={user.pictureUrl || "/default-user.png"} // Default image if no pictureUrl is provided
              alt="User Avatar"
              className={classes.avatar}
            />
          </div>
          <div className={classes.user_details}>
            <p>
              <strong>Username:</strong> {user.userName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default Information;