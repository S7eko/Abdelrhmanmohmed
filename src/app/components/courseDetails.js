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
  const [hasReviewed, setHasReviewed] = useState(false);

  const router = useRouter();
  const { id } = useParams();

  // Fetch course details
  useEffect(() => {
    if (!id) return;

    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`https://skillbridge.runasp.net/api/courses/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch course details");
        }

        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // Check user enrollment
  useEffect(() => {
    const checkEnrollment = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsEnrolled(false);
        return;
      }

      try {
        const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "{}");
        if (enrolledCourses[id]) {
          setIsEnrolled(true);
          return;
        }

        const response = await fetch(`https://skillbridge.runasp.net/api/Courses/${id}/isEnrolled`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to check enrollment");
        }

        const data = await response.json();
        setIsEnrolled(data.isEnrolled);

        if (data.isEnrolled) {
          const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "{}");
          enrolledCourses[id] = true;
          localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setIsEnrolled(false);
      }
    };

    checkEnrollment();
  }, [id]);

  // Fetch reviews
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

  // Check if user has reviewed
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
        setHasReviewed(data.hasReviewed);
      } catch (error) {
        console.error("Error checking if reviewed:", error);
      }
    };

    checkIfReviewed();
  }, [id]);

  const handlePurchase = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: "Login Required",
        text: "You need to login to enroll in this course",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login Now",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/auth/login");
        }
      });
      return;
    }

    Swal.fire({
      title: "Enroll in Course",
      text: `Are you sure you want to enroll in "${course.title}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, enroll!",
      cancelButtonText: "Cancel",
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
            throw new Error(errorData.message || "Failed to enroll");
          }

          Swal.fire({
            title: "Enrolled!",
            text: "You have successfully enrolled in this course",
            icon: "success",
          });
          setIsEnrolled(true);

          const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "{}");
          enrolledCourses[id] = true;
          localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        } catch (error) {
          console.error("Error enrolling:", error);
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
          });
        }
      }
    });
  };

  const handleAddReview = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: "Login Required",
        text: "You need to login to add a review",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login Now",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/auth/login");
        }
      });
      return;
    }

    if (!newReview.trim()) {
      Swal.fire({
        title: "Review Required",
        text: "Please write your review before submitting",
        icon: "warning",
      });
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

      Swal.fire({
        title: "Success!",
        text: "Your review has been submitted",
        icon: "success",
      });
      setNewReview("");
      setNewRating(5);
      setHasReviewed(true);

      // Refresh reviews
      const reviewsResponse = await fetch(`https://skillbridge.runasp.net/api/Reviews/${id}`);
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error adding review:", error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  };

  if (isLoading) return <div><Loader /></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={classes.courseDetails}>
      {course ? (
        <>
          {/* Reordered layout */}
          <div className={classes.courseHeader}>
            <div className={classes.courseImage}>
              <Image className={classes.image} src={course.image} alt={course.title} width={800} height={450} />
            </div>

            <div className={classes.courseBasicInfo}>
              <h1 className={classes.courseTitle}>{course.title}</h1>
              {course.subTitle && (
                <h2 className={classes.courseSubtitle}>{course.subTitle}</h2>
              )}

              {/* Enrollment Button - Moved to top */}
              <div className={classes.enrollmentSection}>
                {!isEnrolled ? (
                  <button className={classes.enrollBtn} onClick={handlePurchase}>
                    Enroll in Course
                  </button>
                ) : (
                  <div className={classes.enrolledActions}>
                    <button
                      className={classes.continueBtn}
                      onClick={() => router.push(`/course/learning-room?id=${id}`)}
                    >
                      Continue Learning
                    </button>
                    <button
                      className={classes.communityBtn}
                      onClick={() => router.push(`/course/Community?id=${id}`)}
                    >
                      Join Community
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Details Section */}
          <div className={classes.courseDetailsSection}>
            <div className={classes.detailsColumn}>
              <div className={classes.detailItem}>
                <span className={classes.detailLabel}>Instructor:</span>
                <span className={classes.detailValue}>{course.instructor}</span>
              </div>
              <div className={classes.detailItem}>
                <span className={classes.detailLabel}>Level:</span>
                <span className={classes.detailValue}>{course.level}</span>
              </div>
              <div className={classes.detailItem}>
                <span className={classes.detailLabel}>Category:</span>
                <span className={classes.detailValue}>{course.category}</span>
              </div>
            </div>

            <div className={classes.detailsColumn}>
              <div className={classes.detailItem}>
                <span className={classes.detailLabel}>Language:</span>
                <span className={classes.detailValue}>{course.language}</span>
              </div>
              <div className={classes.detailItem}>
                <span className={classes.detailLabel}>Rating:</span>
                <span className={classes.detailValue}>{course.rating} ⭐ ({course.students} students)</span>
              </div>
              <div className={classes.detailItem}>
                <span className={classes.detailLabel}>Last Updated:</span>
                <span className={classes.detailValue}>
                  {course.lastUpdated
                    ? new Date(course.lastUpdated).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className={classes.descriptionSection}>
            <h2 className={classes.sectionTitle}>About This Course</h2>
            <p className={classes.descriptionText}>{course.description}</p>
          </div>

          {/* Requirements Section */}
          <div className={classes.requirementsSection}>
            <h2 className={classes.sectionTitle}>Requirements</h2>
            {course.requirements?.length > 0 ? (
              <ul className={classes.requirementsList}>
                {course.requirements.map((req, index) => (
                  <li key={index} className={classes.requirementItem}>
                    {req.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={classes.noContent}>No specific requirements</p>
            )}
          </div>

          {/* Learnings Section */}
          <div className={classes.learningsSection}>
            <h2 className={classes.sectionTitle}>What You'll Learn</h2>
            {course.learnings?.length > 0 ? (
              <ul className={classes.learningsList}>
                {course.learnings.map((learn, index) => (
                  <li key={index} className={classes.learningItem}>
                    {learn.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={classes.noContent}>No learning outcomes listed</p>
            )}
          </div>

          {/* Reviews Section */}
          <div className={classes.reviewsSection}>
            <h2 className={classes.sectionTitle}>
              Reviews ({reviews.length})
              {reviews.length > 0 && (
                <span className={classes.averageRating}>
                  Average Rating:{" "}
                  {(
                    reviews.reduce((sum, review) => sum + review.rating, 0) /
                    reviews.length
                  ).toFixed(1)}
                  /5
                </span>
              )}
            </h2>

            {reviews.length === 0 ? (
              <p className={classes.noReviews}>No reviews yet. Be the first to review!</p>
            ) : (
              <div className={classes.reviewsList}>
                {reviews.map((review, index) => (
                  <div key={index} className={classes.reviewItem}>
                    <div className={classes.reviewHeader}>
                      <span className={classes.reviewAuthor}>{review.userName}</span>
                      <span className={classes.reviewRating}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={i < review.rating ? classes.starFilled : classes.starEmpty}
                          >
                            ★
                          </span>
                        ))}
                      </span>
                      <span className={classes.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={classes.reviewText}>{review.review}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Form */}
            {isEnrolled && !hasReviewed && (
              <div className={classes.addReviewForm}>
                <h3 className={classes.formTitle}>Add Your Review</h3>
                <div className={classes.ratingInput}>
                  <label>Your Rating:</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className={classes.ratingSelect}
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>
                        {num} Star{num !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Share your experience with this course..."
                  className={classes.reviewTextarea}
                  rows={5}
                />
                <button
                  onClick={handleAddReview}
                  className={classes.submitReviewBtn}
                  disabled={!newReview.trim()}
                >
                  Submit Review
                </button>
              </div>
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