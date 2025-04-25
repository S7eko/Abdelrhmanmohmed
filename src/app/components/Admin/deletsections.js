"use client";
import React, { useState, useEffect } from "react";
import classes from "../../style/deletsections.module.css";
import Swal from "sweetalert2";

const DeleteSections = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // تحسين جلب الكورسات مع إدارة أفضل للأخطاء
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
          throw new Error(
            errorData.message || `خطأ في جلب الكورسات: ${response.status}`
          );
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

  // تحسين جلب الأقسام باستخدام API الجديد
  useEffect(() => {
    if (selectedCourse) {
      fetchSections(selectedCourse);
    } else {
      setSections([]);
    }
  }, [selectedCourse]);

  const fetchSections = async (courseId) => {
    setSectionsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("يجب تسجيل الدخول أولاً");

      const response = await fetch(
        `https://skillbridge.runasp.net/api/Courses/sectionsId/${courseId}`,
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
        throw new Error(
          errorData.message || `خطأ في جلب الأقسام: ${response.status}`
        );
      }

      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      setError(error.message);
    } finally {
      setSectionsLoading(false);
    }
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
        if (!token) {
          throw new Error("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى");
        }

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

        // إعادة تحميل الأقسام بعد الحذف
        fetchSections(selectedCourse);
      } catch (error) {
        console.error("Delete error:", error);
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
        <div className={classes.spinner}></div>
        <p>جاري تحميل الكورسات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <div className={classes.errorIcon}>!</div>
        <h3>حدث خطأ</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={classes.retryButton}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.form}>
        <div className={classes.SelectCourse}>
          <label htmlFor="course-select">اختر الكورس:</label>
          <select
            id="course-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={classes.selectInput}
            disabled={isLoading}
          >
            <option value="">اختر كورس</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} (ID: {course.id})
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className={classes.sectionsContainer}>
            <h3>أقسام الكورس</h3>
            {sectionsLoading ? (
              <div className={classes.loadingContainer}>
                <div className={classes.smallSpinner}></div>
                <p>جاري تحميل الأقسام...</p>
              </div>
            ) : sections.length === 0 ? (
              <p className={classes.noSections}>لا توجد أقسام لهذا الكورس</p>
            ) : (
              <ul className={classes.sectionsList}>
                {sections.map((section) => (
                  <li key={section.id} className={classes.sectionItem}>
                    <div className={classes.sectionHeader}>
                      <h4>{section.sectionName || `القسم ${section.id}`}</h4>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className={classes.deleteButton}
                        disabled={sectionsLoading}
                      >
                        حذف القسم
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteSections;