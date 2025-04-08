"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import classes from "../style/courseDetails.module.css";
import Swal from "sweetalert2";
import Loader from "./Loader";

const CourseDetails = () => {
  // State management
  const [state, setState] = useState({
    course: null,
    isLoading: true,
    error: null,
    isEnrolled: false,
    reviews: [],
    newReview: "",
    newRating: 5,
    hasReviewed: false,
    enrollmentChecked: false,
    reviewCheckComplete: false
  });

  const router = useRouter();
  const { id } = useParams();

  // API endpoints
  const API_ENDPOINTS = {
    courseDetails: `https://skillbridge.runasp.net/api/courses/${id}`,
    checkEnrollment: `https://skillbridge.runasp.net/api/Courses/${id}/isEnrolled`,
    enrollCourse: `https://skillbridge.runasp.net/api/Courses/${id}/enroll`,
    getReviews: `https://skillbridge.runasp.net/api/Reviews/${id}`,
    checkReview: `https://skillbridge.runasp.net/api/Reviews/${id}/hasReviewed`,
    submitReview: `https://skillbridge.runasp.net/api/Reviews/${id}`
  };

  // Helper functions
  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Data fetching functions
  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.courseDetails);
      if (!response.ok) throw new Error("Failed to fetch course details");

      const data = await response.json();
      updateState({ course: data, isLoading: false });
    } catch (error) {
      updateState({ error: error.message, isLoading: false });
    }
  };

  const checkEnrollment = async () => {
    const token = localStorage.getItem("token");
    if (!token) return updateState({ enrollmentChecked: true });

    try {
      const response = await fetch(API_ENDPOINTS.checkEnrollment, {
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error("Failed to check enrollment");

      const isEnrolled = await response.json();
      if (isEnrolled) {
        const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "{}");
        enrolledCourses[id] = true;
        localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
      }
      updateState({ isEnrolled, enrollmentChecked: true });
    } catch (error) {
      const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "{}");
      updateState({
        isEnrolled: enrolledCourses[id] || false,
        enrollmentChecked: true
      });
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getReviews);
      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      updateState({ reviews: data });
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const checkIfReviewed = async () => {
    const token = localStorage.getItem("token");
    if (!token || !state.isEnrolled) return updateState({ reviewCheckComplete: true });

    try {
      const response = await fetch(API_ENDPOINTS.checkReview, {
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error("Failed to check if reviewed");

      const hasReviewedResponse = await response.json();
      updateState({ hasReviewed: hasReviewedResponse, reviewCheckComplete: true });
    } catch (error) {
      console.error("Error checking if reviewed:", error);
      updateState({ reviewCheckComplete: true });
    }
  };

  // Event handlers
  const handlePurchase = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "You need to be logged in to purchase the course.", "error");
      return updateState({ error: "You need to be logged in to purchase the course." });
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to enroll in this course?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, enroll!",
      cancelButtonText: "No, cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(API_ENDPOINTS.enrollCourse, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to enroll in the course");
        }

        Swal.fire("Success!", "Course enrolled successfully!", "success");
        const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "{}");
        enrolledCourses[id] = true;
        localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        updateState({ isEnrolled: true });
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleAddReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Error", "You need to be logged in to add a review.", "error");

    try {
      const response = await fetch(API_ENDPOINTS.submitReview, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify({
          review: state.newReview,
          rating: state.newRating,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add review");
      }

      Swal.fire("Success!", "Review added successfully!", "success");
      const reviewsData = await fetch(API_ENDPOINTS.getReviews).then(res => res.json());
      updateState({
        newReview: "",
        newRating: 5,
        hasReviewed: true,
        reviews: reviewsData
      });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // Effects
  useEffect(() => {
    if (!id) return;
    fetchCourseDetails();
  }, [id]);

  useEffect(() => {
    checkEnrollment();
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [id, state.hasReviewed]);

  useEffect(() => {
    if (state.enrollmentChecked) {
      checkIfReviewed();
    }
  }, [id, state.isEnrolled, state.enrollmentChecked]);

  // Render
  if (state.isLoading) return <div><Loader /></div>;
  if (state.error) return <div>Error: {state.error}</div>;

  return (
    <div className={classes.courseDetails}>
      {state.course ? (
        <>
          {/* Course details section */}
          <div className={classes.courseDetails_image}>
            <Image
              src={state.course.image}
              alt={state.course.title}
              width={500}
              height={300}
            />
          </div>

          <div className={classes.courseDetails_info}>
            <h1><strong>Title:</strong> {state.course.title}</h1>
            {state.course.subTitle && (
              <h2 style={{ fontWeight: 'normal', fontStyle: 'italic', color: '#666' }}>
                {state.course.subTitle}
              </h2>
            )}

            <p><strong>Description:</strong> {state.course.description}</p>
            <p><strong>Instructor:</strong> {state.course.instructor}</p>
            <p><strong>Level:</strong> {state.course.level}</p>
            <p><strong>Category:</strong> {state.course.category}</p>
            <p><strong>Language:</strong> {state.course.language}</p>
            <p><strong>Rating:</strong> {state.course.rating}</p>
            <p><strong>Students:</strong> {state.course.students}</p>

            <p>
              <strong>Last Updated:</strong>{" "}
              {state.course.lastUpdated
                ? new Date(state.course.lastUpdated).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : "N/A"}
            </p>

            <p><strong>Requirements:</strong></p>
            <ul>
              {state.course.requirements?.length > 0 ? (
                state.course.requirements.map((req, index) => (
                  <li key={index}>{req.name}</li>
                ))
              ) : (
                <li>No requirements</li>
              )}
            </ul>

            <p><strong>What You Will Learn:</strong></p>
            <ul>
              {state.course.learnings?.length > 0 ? (
                state.course.learnings.map((learn, index) => (
                  <li key={index}>{learn.name}</li>
                ))
              ) : (
                <li>No learning outcomes listed</li>
              )}
            </ul>
          </div>

          {/* Reviews section */}
          <div className={classes.reviewsSection}>
            <h2>Reviews</h2>
            {state.reviews.length === 0 ? (
              <p>No reviews yet. Be the first to review this course!</p>
            ) : (
              state.reviews.map((review, index) => (
                <div key={index} className={classes.reviewItem}>
                  <p><strong>{review.userName}</strong> - Rating: {review.rating}/5</p>
                  <p>{review.review}</p>
                </div>
              ))
            )}

            {/* Review form */}
            {state.isEnrolled && !state.hasReviewed && state.reviewCheckComplete && (
              <div className={classes.addReviewForm}>
                <h3>Add a Review</h3>
                <textarea
                  value={state.newReview}
                  onChange={(e) => updateState({ newReview: e.target.value })}
                  placeholder="Write your review..."
                  className={classes.reviewTextarea}
                />
                <div className={classes.ratingInput}>
                  <label>Rating:</label>
                  <select
                    value={state.newRating}
                    onChange={(e) => updateState({ newRating: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <button className={classes.btn} onClick={handleAddReview}>
                  Submit Review
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className={classes.courseDetails_button}>
            {!state.isEnrolled ? (
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