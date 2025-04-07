// components/dashboard/CoursesPage.js
"use client";
import React, { useEffect, useState } from "react";
import CourseList from "./courseList";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://skillbridge.runasp.net/api/courses");
        const data = await response.json();
        setCourses(data); // حفظ الكورسات
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Available Courses</h1>
      {courses.length > 0 ? <CourseList courses={courses} /> : <p>No courses available.</p>}
    </div>
  );
};

export default CoursesPage;
