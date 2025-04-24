"use client";
import React, { useState, useEffect } from "react";
import classes from "../../style/DeleteReviews.module.css";
import Swal from "sweetalert2";

const DeleteReviews = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

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
      console.log("Fetching reviews for course:", selectedCourse);
      fetchReviews(selectedCourse);
    } else {
      setReviews([]);
    }
  }, [selectedCourse]);

  const fetchReviews = async (courseId) => {
    setReviewsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("يجب تسجيل الدخول أولاً");

      const response = await fetch(
        `https://skillbridge.runasp.net/api/Reviews/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`خطأ في جلب التعليقات: ${response.status}`);
      }

      const data = await response.json();
      console.log("Reviews data:", data);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError(error.message);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع التعليق بعد حذفه!",
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
          `https://skillbridge.runasp.net/api/Reviews/${reviewId}`,
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
          throw new Error(errorData.message || "فشل في حذف التعليق");
        }

        Swal.fire("تم الحذف!", "تم حذف التعليق بنجاح", "success");
        fetchReviews(selectedCourse);
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
          <div className={classes.reviewsContainer}>
            <h3>تعليقات الكورس</h3>
            {reviewsLoading ? (
              <div className={classes.loadingContainer}>
                <div className={classes.smallSpinner}></div>
                <p>جاري تحميل التعليقات...</p>
              </div>
            ) : reviews.length === 0 ? (
              <p>لا توجد تعليقات لهذا الكورس</p>
            ) : (
              <div className={classes.reviewsList}>
                {reviews.map((review) => (
                  <div key={review.id} className={classes.reviewItem}>
                    <div className={classes.reviewHeader}>
                      {review.userImage && (
                        <img
                          src={review.userImage}
                          alt={review.userName}
                          className={classes.userImage}
                        />
                      )}
                      <div>
                        <span className={classes.reviewAuthor}>
                          {review.userName}
                        </span>
                        <span className={classes.reviewRating}>
                          التقييم: {review.rating}/5
                        </span>
                      </div>
                    </div>
                    <p className={classes.reviewContent}>{review.review}</p>
                    <div className={classes.reviewFooter}>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className={classes.deleteButton}
                      >
                        حذف التعليق
                      </button>
                    </div>
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

export default DeleteReviews;
