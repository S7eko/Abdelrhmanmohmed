"use client";
import React, { useState, useEffect } from "react";
import classes from "../../style/deletePost.module.css";
import Swal from "sweetalert2";

const DeleteSections = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);

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
        const coursesData = data.data || data;
        console.log("Courses data:", coursesData);
        setCourses(coursesData);
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
      console.log("Fetching sections for course:", selectedCourse);
      fetchSections(selectedCourse); // تعديل هنا لاستدعاء API الجديد
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
        `https://skillbridge.runasp.net/api/Sections/${courseId}`, // استخدام API الصحيح هنا
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`خطأ في جلب الأقسام: ${response.status}`);
      }

      const data = await response.json();
      console.log("Sections data:", data);
      setSections(data.sections || []); // تأكد من جلب الأقسام بشكل صحيح
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
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("انتهت الجلسة", "يجب تسجيل الدخول مرة أخرى", "error");
          return;
        }

        const response = await fetch(
          `https://skillbridge.runasp.net/api/Admin/sections/${sectionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Delete response error data:", errorData);
          throw new Error(errorData.message || "فشل في حذف القسم");
        }

        Swal.fire("تم الحذف!", "تم حذف القسم بنجاح", "success");
        fetchSections(selectedCourse); // تحديث الأقسام بعد الحذف
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("خطأ", error.message, "error");
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
          <label>اختر الكورس:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={classes.selectInput}
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
            <h3>الأقسام المتعلقة بالكورس</h3>
            {sectionsLoading ? (
              <div className={classes.loadingContainer}>
                <div className={classes.smallSpinner}></div>
                <p>جاري تحميل الأقسام...</p>
              </div>
            ) : sections.length === 0 ? (
              <p>لا توجد أقسام لهذا الكورس</p>
            ) : (
              <div className={classes.sectionsList}>
                {sections.map((section) => (
                  <div key={section.id} className={classes.sectionItem}>
                    <h4>{section.sectionName}</h4> {/* عرض اسم القسم */}
                    <p>{section.description}</p>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className={classes.deleteButton}
                    >
                      حذف القسم
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteSections;
