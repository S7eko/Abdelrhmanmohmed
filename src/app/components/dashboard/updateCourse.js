import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "../../style/Update.module.css";

const UpdateCourse = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch courses for the instructor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://skillbridge.runasp.net/api/Courses/instructor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to load courses. Please try again later.",
        });
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Load course details when selected
  useEffect(() => {
    if (!selectedCourseId) return;

    const course = courses.find(c => c.id === selectedCourseId);
    if (course) {
      setSelectedCourse(course);
      setTitle(course.title);
      setSubtitle(course.subtitle || "");
      setImagePreview(course.imageUrl || "");
    }
  }, [selectedCourseId, courses]);

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      setImage(selectedImage);
      // Create a preview URL for the image
      setImagePreview(URL.createObjectURL(selectedImage));
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourseId) {
      showWarning("Please select a course to update");
      return;
    }

    if (!title) {
      showWarning("Course title cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Unauthorized - Please login again");
      }

      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Subtitle", subtitle);
      if (image) {
        formData.append("Image", image);
      }

      const apiUrl = `https://skillbridge.runasp.net/api/Courses/${selectedCourseId}`;
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // First check if response is OK
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Server error (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, try to read as text
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      // Handle successful response
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        // If no JSON response, but status is OK, consider it successful
        responseData = { message: "Course updated successfully" };
      }

      showSuccess(responseData.message);

      // Reset form or update local state as needed
      if (responseData.id) { // If we got updated course data
        setSelectedCourse(responseData);
        setTitle(responseData.title);
        setSubtitle(responseData.subtitle || "");
        setImagePreview(responseData.imageUrl || "");
      }
      setImage(null);

    } catch (error) {
      handleUploadError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const showWarning = (text, title = "Warning") => {
    Swal.fire({
      icon: "warning",
      title,
      text,
    });
  };

  const showSuccess = (message) => {
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleUploadError = (error) => {
    console.error("Update Error:", error);
    let errorMessage = error.message;

    if (error.name === "AbortError") {
      errorMessage = "Request timed out. Please try again.";
    } else if (error.message.includes("Failed to fetch")) {
      errorMessage = "Network error. Please check your connection.";
    } else if (error.message.includes("401")) {
      errorMessage = "Session expired. Please login again.";
    } else if (error.message.includes("500")) {
      errorMessage = "Server error. Please try again later or contact support.";
    }

    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: errorMessage,
      confirmButtonText: "OK",
    });
  };

  if (isLoadingCourses) {
    return <div className={styles.loading}>Loading courses...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Update Course</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Select Course:</label>
          <select
            value={selectedCourseId}
            onChange={handleCourseChange}
            className={styles.input}
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Course Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Course Subtitle:</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Course Image:</label>
             
              <div className={styles.fileInputContainer}>
                <input
                  type="file"
                  id="imageUpload"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                  accept="image/*"
                />
                <label htmlFor="imageUpload" className={styles.fileInputLabel}>
                  {image ? "Change Image" : "Upload Image"}
                </label>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Updating...
                  </>
                ) : (
                  "Update Course"
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default UpdateCourse;