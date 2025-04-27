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
        if (!token) throw new Error("يجب تسجيل الدخول أولاً");

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
          throw new Error(errorData.message || `خطأ في جلب الكورسات: ${response.status}`);
        }

        const data = await response.json();
        setCourses(data.data || data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(error.message);

        if (error.message.includes("401")) {
          Swal.fire({
            title: "انتهت الجلسة",
            text: "يجب تسجيل الدخول مرة أخرى",
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
      if (!token) throw new Error("يجب تسجيل الدخول أولاً");

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
        throw new Error(errorData.message || `خطأ في جلب السكاشن: ${response.status}`);
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
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع القسم بعد حذفه!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى");

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
          throw new Error(errorData.message || "فشل في حذف القسم");
        }

        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف القسم بنجاح",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchSectionsAndLectures(selectedCourse);
      } catch (error) {
        console.error("Delete section error:", error);
        Swal.fire({
          title: "خطأ!",
          text: error.message,
          icon: "error",
        });
      }
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع المحاضرة بعد حذفها!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى");

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
          throw new Error(errorData.message || "فشل في حذف المحاضرة");
        }

        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف المحاضرة بنجاح",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchSectionsAndLectures(selectedCourse);
      } catch (error) {
        console.error("Delete lecture error:", error);
        Swal.fire({
          title: "خطأ!",
          text: error.message,
          icon: "error",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <p>جاري تحميل الكورسات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={classes.retryButton}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.form}>
        <div className={classes.SelectCourse}>
          <label>اختر الكورس:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={classes.selectInput}
          >
            <option value="">اختر كورس</option>
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
                <p>جاري تحميل السكاشن والمحاضرات...</p>
              </div>
            ) : sections.length === 0 ? (
              <p>لا توجد أقسام</p>
            ) : (
              sections.map((section) => (
                <div key={section.id} className={classes.sectionItem}>
                  <div className={classes.sectionHeader}>
                    <h4>{section.name || `القسم ${section.id}`}</h4>
                    <div className={classes.sectionActions}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={classes.toggleButton}
                      >
                        {expandedSections.includes(section.id) ? "إخفاء المحاضرات" : "عرض المحاضرات"}
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className={classes.deleteButton}
                      >
                        حذف القسم
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
                                حذف المحاضرة
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={classes.noLectures}>لا توجد محاضرات في هذا القسم</p>
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
