import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import classes from "./mycourses.module.css"; // Import your CSS module
import Image from "next/image";
import Loader from "../../Loader";

const Mycourses = () => {
  const [courses, setCourses] = useState([]); // State to store the courses
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(""); // State to handle errors

  // Fetch courses when the component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        if (!token) {
          Swal.fire({
            icon: "error",
            title: "Unauthorized",
            text: "Please login first 🔑",
          });
          return;
        }

        const response = await fetch("https://skillbridge.runasp.net/api/Courses/student", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        });

        // Log the response for debugging
        console.log("Response Status:", response.status);

        if (!response.ok) {
          throw new Error("Failed to fetch courses.");
        }

        const data = await response.json();
        setCourses(data); // Set the fetched courses
        setError(""); // Clear any errors
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(error.message || "Failed to fetch courses. Please try again later.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className={classes.loading}><Loader /></div>;
  }

  if (error) {
    return <div className={classes.error}>{error}</div>;
  }

  return (
    <div className={classes.container}>
      <h2>My Courses</h2>
      {courses.length === 0 ? (
        <p>You are not enrolled in any courses yet.</p>
      ) : (
        <div className={classes.courseList}>
          {courses.map((course) => (
            <div key={course.id} className={classes.courseCard}>
              <Image src={course.image} alt={course.title} width={200} height={200} />
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>Instructor: {course.instructor}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mycourses;