"use client";
import React, { useState, useEffect } from "react";
import classes from "../../style/deletsections.module.css";
import Swal from "sweetalert2";

const DeleteSections = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You must log in first");

        const response = await fetch(
          "https://skillbridge.runasp.net/api/Courses?pageIndex=1&pageSize=1000",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error fetching courses: ${response.status}`);
        }

        const data = await response.json();
        setCourses(data.data || data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(error.message);

        if (error.message.includes("401")) {
          Swal.fire({
            title: "Session Expired",
            text: "You must log in again",
            icon: "error",
          }).then(() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSectionsAndLectures(selectedCourse);
    } else {
      setSections([]);
    }
  }, [selectedCourse]);

  const fetchSectionsAndLectures = async (courseId) => {
    setLoadingSections(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must log in first");

      const response = await fetch(
        `https://skillbridge.runasp.net/api/Lectures/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setSections([]);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error fetching sections: ${response.status}`);
      }

      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sections and lectures:", error);
      setError(error.message);
    } finally {
      setLoadingSections(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prevExpanded) =>
      prevExpanded.includes(sectionId)
        ? prevExpanded.filter((id) => id !== sectionId)
        : [...prevExpanded, sectionId]
    );
  };

  const handleDeleteSection = async (sectionId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this section after deletion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Session expired, please log in again");

        const response = await fetch(
          `https://skillbridge.runasp.net/api/Admin/sections/${sectionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to delete the section");
        }

        Swal.fire({
          title: "Deleted!",
          text: "The section was deleted successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchSectionsAndLectures(selectedCourse);
      } catch (error) {
        console.error("Delete section error:", error);
        Swal.fire({
          title: "Error!",
          text: error.message,
          icon: "error",
        });
      }
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this lecture after deletion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Session expired, please log in again");

        const response = await fetch(
          `https://skillbridge.runasp.net/api/Admin/lectures/${lectureId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to delete the lecture");
        }

        Swal.fire({
          title: "Deleted!",
          text: "The lecture was deleted successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchSectionsAndLectures(selectedCourse);
      } catch (error) {
        console.error("Delete lecture error:", error);
        Swal.fire({
          title: "Error!",
          text: error.message,
          icon: "error",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={classes.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.form}>
        <div className={classes.SelectCourse}>
          <label>Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={classes.selectInput}
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
            {loadingSections ? (
              <div className={classes.loadingContainer}>
                <p>Loading sections and lectures...</p>
              </div>
            ) : sections.length === 0 ? (
              <p>No sections available</p>
            ) : (
              sections.map((section) => (
                <div key={section.id} className={classes.sectionItem}>
                  <div className={classes.sectionHeader}>
                    <h4>{section.name || `Section ${section.id}`}</h4>
                    <div className={classes.sectionActions}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={classes.toggleButton}
                      >
                        {expandedSections.includes(section.id) ? "Hide lectures" : "Show lectures"}
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className={classes.deleteButton}
                      >
                        Delete Section
                      </button>
                    </div>
                  </div>

                  {expandedSections.includes(section.id) && (
                    <div className={classes.lecturesContainer}>
                      {section.lectures.length > 0 ? (
                        <ul className={classes.lecturesList}>
                          {section.lectures.map((lecture) => (
                            <li key={lecture.id} className={classes.lectureItem}>
                              <span>{lecture.title}</span>
                              <button
                                onClick={() => handleDeleteLecture(lecture.id)}
                                className={classes.deleteLectureButton}
                              >
                                Delete Lecture
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={classes.noLectures}>No lectures in this section</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteSections;
