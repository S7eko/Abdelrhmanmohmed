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
        if (!token) throw new Error("You must be logged in first");

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
            errorData.message || `Error fetching courses: ${response.status}`
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
            title: "Session expired",
            text: "You need to log in again",
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
      if (!token) throw new Error("You must be logged in first");

      const response = await fetch(
        `https://skillbridge.runasp.net/api/Reviews/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching reviews: ${response.status}`);
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
      title: "Are you sure?",
      text: "You won't be able to recover this review once deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Session expired", "You need to log in again", "error");
          return;
        }

        const response = await fetch(
          `https://skillbridge.runasp.net/api/Admin/reviews/${reviewId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Delete response:", response);

        if (response.status === 204 || response.status === 200) {
          Swal.fire("Deleted!", "The review has been deleted successfully", "success");
          fetchReviews(selectedCourse);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Delete error details:", errorData);
          throw new Error(errorData.message || "Failed to delete the review");
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error", error.message || "An error occurred while attempting to delete", "error");
      }
    }
  };

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <div className={classes.errorIcon}>!</div>
        <h3>Error occurred</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={classes.retryButton}
        >
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
                {course.title} (ID: {course.id})
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className={classes.reviewsContainer}>
            <h3>Course Reviews</h3>
            {reviewsLoading ? (
              <div className={classes.loadingContainer}>
                <div className={classes.smallSpinner}></div>
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <p>No reviews for this course</p>
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
                      <div className={classes.reviewInfo}>
                        <span className={classes.reviewAuthor}>
                          {review.userName}
                        </span>
                        <span className={classes.reviewRating}>
                          Rating: {review.rating}/5
                        </span>
                        <span className={classes.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    </div>
                    <p className={classes.reviewContent}>{review.review}</p>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className={classes.deleteButton}
                    >
                      Delete Review
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

export default DeleteReviews;
