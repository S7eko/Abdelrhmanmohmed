"use client";
import React, { useState } from "react";
import classes from "./change.module.css";
import Swal from "sweetalert2";

const ChangeImage = () => {
  const [file, setFile] = useState(null); // State to store the selected file
  const [preview, setPreview] = useState(null); // State to store the image preview URL
  const [loading, setLoading] = useState(false); // State to handle loading state
  const [error, setError] = useState(""); // State to handle error messages

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file (JPEG, PNG, etc.).");
        return;
      }

      // Validate file size (less than 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB.");
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Create a preview URL
      setError(""); // Clear any previous errors
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // Append the file to the FormData object

    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // Get the token from localStorage
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Unauthorized",
          text: "Please login first 🔑",
        });
        return;
      }

      const response = await fetch("https://skillbridge.runasp.net/api/Users/changePicture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request
        },
        body: formData, // Send the FormData object
      });

      // Log the response for debugging
      console.log("Response Status:", response.status);
      const responseData = await response.json();
      console.log("Response Data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to upload image.");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile picture updated successfully! ✅",
      });

      // Reset the form
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(error.message || "Failed to upload image. Please try again later.");

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to upload image. ❌",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <h2>Change Profile Picture</h2>
      {error && <p className={classes.error}>{error}</p>}
      <div className={classes.uploadSection}>
        {preview ? (
          <div className={classes.previewContainer}>
            <img src={preview} alt="Preview" className={classes.previewImage} />
            <button
              className={classes.removeButton}
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              Remove Image
            </button>
          </div>
        ) : (
          <label className={classes.uploadLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={classes.fileInput}
            />
            <span className={classes.uploadText}>
              Choose an image (JPEG, PNG, etc.)
            </span>
          </label>
        )}
      </div>
      <button
        className={classes.uploadButton}
        onClick={handleUpload}
        disabled={loading || !file}
      >
        {loading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
};

export default ChangeImage;