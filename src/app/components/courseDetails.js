"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import classes from "../style/courseDetails.module.css";
import Swal from "sweetalert2";
import Loader from "./Loader";

const CourseDetails = () => {
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false); // حالة جديدة

  const router = useRouter();
  const { id } = useParams();

  // جلب تفاصيل الكورس
  useEffect(() => {
    if (!id) return;

    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`https://skillbridge.runasp.net/api/courses/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch course details");
        }

        const data = await response.json();
        console.log("Course data fetched:", data);

        if (data) {
          setCourse(data);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // التحقق من اشتراك المستخدم في الكورس
  useEffect(() => {
    const checkEnrollment = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setEnrollmentChecked(true);
        return;
      }

      try {
        // أولاً: التحقق من حالة التسجيل من الخادم مباشرة
        const response = await fetch(`https://skillbridge.runasp.net/api/Courses/${id}/isEnrolled`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to check enrollment");
        }

        // هنا نعتبر أن الاستجابة هي true/false مباشرة
        const isEnrolled = await response.json();
        setIsEnrolled(isEnrolled);

        // تحديث localStorage للحفاظ على الحالة محلياً
        if (isEnrolled) {
          const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "{}");
          enrolledCourses[id] = true;
          localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);

        // كحالة احتياطية، نتحقق من localStorage إذا فشل الاتصال بالخادم
        const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "{}");
        if (enrolledCourses[id]) {
          setIsEnrolled(true);
        }
      } finally {
        setEnrollmentChecked(true);
      }
    };

    checkEnrollment();
  }, [id]);

  // جلب المراجعات الحالية
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`https://skillbridge.runasp.net/api/Reviews/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [id]);

  // التحقق مما إذا كان المستخدم قد قام بمراجعة الكورس
  useEffect(() => {
    const checkIfReviewed = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`https://skillbridge.runasp.net/api/Reviews/${id}/hasReviewed`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to check if reviewed");
        }

        const data = await response.json();
        setHasReviewed(data.hasReviewed); // تحديث الحالة بناءً على الاستجابة
      } catch (error) {
        console.error("Error checking if reviewed:", error);
      }
    };

    checkIfReviewed();
  }, [id]);

  // معالجة عملية التسجيل في الكورس
  const handlePurchase = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You need to be logged in to purchase the course.");
      Swal.fire("Error", "You need to be logged in to purchase the course.", "error");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to enroll in this course?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, enroll!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`https://skillbridge.runasp.net/api/Courses/${id}/enroll`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to enroll in the course");
          }

          Swal.fire("Success!", "Course enrolled successfully!", "success");
          setIsEnrolled(true);

          const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "{}");
          enrolledCourses[id] = true;
          localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        } catch (error) {
          console.error("Error enrolling in the course:", error);
          setError("Failed to enroll in the course");
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  // إضافة مراجعة جديدة
  const handleAddReview = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("Error", "You need to be logged in to add a review.", "error");
      return;
    }

    try {
      const response = await fetch(`https://skillbridge.runasp.net/api/Reviews/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          review: newReview,
          rating: newRating,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add review");
      }

      Swal.fire("Success!", "Review added successfully!", "success");
      setNewReview("");
      setNewRating(5);
      setHasReviewed(true); // تحديث الحالة بعد إضافة المراجعة

      // جلب المراجعات المحدثة
      const reviewsResponse = await fetch(`https://skillbridge.runasp.net/api/Reviews/${id}`);
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error adding review:", error);
      Swal.fire("Error", error.message, "error");
    }
  };

  if (isLoading) return <div><Loader /></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={classes.courseDetails}>
      {course ? (
        <>
          {/* قسم تفاصيل الكورس */}
          <div className={classes.courseDetails_image}>
            <Image src={course.image} alt={course.title} width={500} height={300} />
          </div>
          <div className={classes.courseDetails_info}>
            {/* Course Image */}


            {/* Course Title & Subtitle */}
            <h1>
              <strong>Title:</strong> {course.title}
            </h1>
            {course.subTitle && (
              <h2 style={{ fontWeight: 'normal', fontStyle: 'italic', color: '#666' }}>
                {course.subTitle}
              </h2>
            )}

            {/* Course Description */}
            <p>
              <strong>Description:</strong> {course.description}
            </p>

            {/* Instructor Info */}
            <p>
              <strong>Instructor:</strong> {course.instructor}
            </p>

            {/* Other Course Details */}
            <p>
              <strong>Level:</strong> {course.level}
            </p>
            <p>
              <strong>Category:</strong> {course.category}
            </p>
            <p>
              <strong>Language:</strong> {course.language}
            </p>
            <p>
              <strong>Rating:</strong> {course.rating}
            </p>
            <p>
              <strong>Students:</strong> {course.students}
            </p>

            {/* Last Updated */}
            <p>
              <strong>Last Updated:</strong>{" "}
              {course.lastUpdated
                ? new Date(course.lastUpdated).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : "N/A"}
            </p>

            {/* Requirements */}
            <p>
              <strong>Requirements:</strong>
            </p>
            <ul>
              {course.requirements?.length > 0 ? (
                course.requirements.map((req, index) => (
                  <li key={index}>{req.name}</li>
                ))
              ) : (
                <li>No requirements</li>
              )}
            </ul>

            {/* Learnings */}
            <p>
              <strong>What You Will Learn:</strong>
            </p>
            <ul>
              {course.learnings?.length > 0 ? (
                course.learnings.map((learn, index) => (
                  <li key={index}>{learn.name}</li>
                ))
              ) : (
                <li>No learning outcomes listed</li>
              )}
            </ul>
          </div>


          {/* قسم المراجعات */}
          <div className={classes.reviewsSection}>
            <h2>Reviews</h2>
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first to review this course!</p>
            ) : (
              reviews.map((review, index) => (
                <div key={index} className={classes.reviewItem}>
                  <p>
                    <strong>{review.userName}</strong> - Rating: {review.rating}/5
                  </p>
                  <p>{review.review}</p>
                </div>
              ))
            )}

            {/* نموذج إضافة مراجعة جديدة */}
            {isEnrolled && !hasReviewed && (
              <div className={classes.addReviewForm}>
                <h3>Add a Review</h3>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Write your review..."
                  className={classes.reviewTextarea}
                />
                <div className={classes.ratingInput}>
                  <label>Rating:</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <button className={classes.btn} onClick={handleAddReview}>
                  Submit Review
                </button>
              </div>
            )}
          </div>

          {/* زر التسجيل أو الاستمرار */}
          <div className={classes.courseDetails_button}>
            {!isEnrolled ? (
              <button className={classes.btn} onClick={handlePurchase}>
                Enroll in COURSE
              </button>
            ) : (
              <>
                <button
                  className={classes.btn}
                  onClick={() => router.push(`/course/learning-room?id=${id}`)}
                >
                  Continue
                </button>
                <button
                  className={classes.btn}
                  onClick={() => router.push(`/course/Community?id=${id}`)}
                >
                  Community
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <p>Course not found</p>
      )}
    </div>
  );
};

export default CourseDetails;