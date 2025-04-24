"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "../../style/addFile.module.css";

const AddFile = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // جلب الكورسات للمدرس
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch("https://skillbridge.runasp.net/api/Courses/instructor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        showError("Failed to load courses", error.message);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // جلب الأقسام عند اختيار كورس
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchSections = async () => {
      setIsLoadingSections(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `https://skillbridge.runasp.net/api/Courses/sectionsId/${selectedCourseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sections");
        }

        const data = await response.json();
        setSections(data);
      } catch (error) {
        console.error("Error fetching sections:", error);
        showError("Failed to load sections", error.message);
      } finally {
        setIsLoadingSections(false);
      }
    };

    fetchSections();
  }, [selectedCourseId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
    setSelectedSectionId("");
    setSections([]);
  };

  const handleSectionChange = (e) => {
    setSelectedSectionId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadProgress(0);

    // التحقق من المدخلات
    if (!selectedSectionId) {
      showWarning("Please select a section");
      return;
    }

    if (!file) {
      showWarning("Please select a file to upload");
      return;
    }

    // التحقق من حجم الملف (10MB كحد أقصى)
    if (file.size > 10 * 1024 * 1024) {
      showWarning("Maximum file size is 10MB", "File too large");
      return;
    }

    // التحقق من امتداد الملف
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      showWarning(`Allowed file types: ${allowedExtensions.join(', ')}`, "Invalid file type");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Unauthorized - Please login again");
      }

      const formData = new FormData();
      formData.append("file", file);

      // استخدام XMLHttpRequest لتتبع التقدم
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (error) {
                resolve({});
              }
            } else {
              try {
                reject(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("POST", `https://skillbridge.runasp.net/api/Files/${selectedSectionId}`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });

      showSuccess(response.message || "File uploaded successfully!");
      resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      showError("Upload failed", error.message || "An error occurred during upload");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // دوال مساعدة
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
    });
  };

  const showError = (title, message) => {
    Swal.fire({
      icon: "error",
      title,
      text: message,
    });
  };

  const resetForm = () => {
    setFile(null);
    setFileName("");
  };

  if (isLoadingCourses) {
    return <div className={styles.loading}>Loading courses...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Upload File to Section</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Select Course:</label>
          <select
            value={selectedCourseId}
            onChange={handleCourseChange}
            className={styles.select}
            required
            disabled={isSubmitting}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {selectedCourseId && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Section:</label>
            <select
              value={selectedSectionId}
              onChange={handleSectionChange}
              className={styles.select}
              required
              disabled={isLoadingSections || isSubmitting}
            >
              <option value="">Select a section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.sectionName}
                </option>
              ))}
            </select>
            {isLoadingSections && <div className={styles.loadingText}>Loading sections...</div>}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>Select File:</label>
          <div className={styles.fileInputContainer}>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              className={styles.fileInput}
              required
              disabled={isSubmitting}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            />
            <label htmlFor="fileUpload" className={styles.fileInputLabel}>
              {fileName || "Choose a file"}
            </label>
          </div>
          {fileName && (
            <div className={styles.fileInfo}>
              <span>Selected: {fileName}</span>
              <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          )}
        </div>

        {uploadProgress > 0 && (
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || !selectedSectionId || !file}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner}></span>
              {uploadProgress > 0 ? `Uploading (${uploadProgress}%)` : "Uploading..."}
            </>
          ) : (
            "Upload File"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddFile;