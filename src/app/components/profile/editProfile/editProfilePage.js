"use client";
import React, { useState, useEffect } from "react";
import classes from "./editProfilePage.module.css";
import ChangeImage from "../changeImage/change";
import ChangeEmail from "../ChangeEmail/changeEmail";
import ChangePassword from "../changepassword/changePAssword";
import Mycourses from "../mycourses/mycourses";
import Information from "../myinformation/infourmation";

const EditProfilePage = () => {
  const [selectedPage, setSelectedPage] = useState("profile");
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(""); // State to handle errors

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        if (!token) {
          throw new Error("Please login first.");
        }

        const response = await fetch(
          "http://skillbridge.runasp.net/api/Users/currentUser",
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

  const handlePageChange = (page) => {
    setSelectedPage(page);
  };

  const renderPage = () => {
    switch (selectedPage) {
      case "profile":
        return <p>Profile Content Here</p>;
      case "photo":
        return <ChangeImage />;
      case "account":
        return <ChangeEmail />;
      case "password":
        return <ChangePassword />;
      case "infourmation":
        return <Information />;
      case "courses":
        return <Mycourses />;
      default:
        return <p>Select a page to view content.</p>;
    }
  };

  if (loading) {
    return <p>Loading user information...</p>;
  }

  if (error) {
    return <p className={classes.error}>{error}</p>;
  }

  return (
    <div className={classes.container}>
      <h1>Public Profile</h1>
      <p>Add information about yourself</p>

      <div className={classes.profile_section}>
        {/* Sidebar */}
        <div className={classes.sidebar}>
          <div className={classes.user_info}>
            <img
              src={user?.pictureUrl || "/user.svg"} // Use user's picture or a default image
              alt="User Avatar"
              className={classes.user_avatar}
            />
            <h3>{user?.userName || "User"}</h3> {/* Use user's name or a default */}
            <p>View public profile</p>
          </div>
          <ul className={classes.sidebar_menu}>
            <li
              className={selectedPage === "infourmation" ? classes.active : ""}
              onClick={() => handlePageChange("infourmation")}
            >
              Profile
            </li>
            <li
              className={selectedPage === "photo" ? classes.active : ""}
              onClick={() => handlePageChange("photo")}
            >
              Photo
            </li>
            <li
              className={selectedPage === "account" ? classes.active : ""}
              onClick={() => handlePageChange("account")}
            >
              Change Email
            </li>
            <li
              className={selectedPage === "password" ? classes.active : ""}
              onClick={() => handlePageChange("password")}
            >
              Change Password
            </li>
            <li
              className={selectedPage === "courses" ? classes.active : ""}
              onClick={() => handlePageChange("courses")}
            >
              My Courses
            </li>
            
            <li
              className={selectedPage === "close" ? classes.active : ""}
              onClick={() => handlePageChange("close")}
            >
              Close Account
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className={classes.main_content}>{renderPage()}</div>
      </div>
    </div>
  );
};

export default EditProfilePage;