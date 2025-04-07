"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // استخدام next/navigation بدلاً من next/router
import Image from "next/image";
import classes from "../style/courseDetails.module.css"; // تأكد من مسار الملف

const CourseDetails = () => {
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter(); // استخدام useRouter من next/navigation
  const { id } = useParams(); // استخدام useParams للحصول على الـ id من الـ URL

  // التأكد من وجود الـ id قبل أن نقوم بتحميل البيانات
  useEffect(() => {
    // التأكد من وجود الـ id من الـ URL قبل بدء تحميل البيانات
    if (!id) return; // إذا لم يكن هناك id، لا نقوم بأي شيء

    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`https://skillbridge.runasp.net/api/courses/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch course details");
        }

        const data = await response.json();
        console.log("Course data fetched:", data);

        if (data) {
          setCourse(data); // تعيين البيانات المستلمة في الحالة
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
  }, [id]); // فقط عندما يتغير الـ id

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={classes.courseDetails}>
      {course ? (
        <>
          <div className={classes.courseDetails_image}>
            <Image src={course.Image} alt={course.Title} width={500} height={300} />
          </div>
          <div className={classes.courseDetails_info}>
            <h1>{course.Title}</h1>
            <p>{course.Description}</p>
            <p>
              <strong>Instructor:</strong> {course.Instructor}
            </p>
            <p>
              <strong>Level:</strong> {course.Level}
            </p>
            <p>
              <strong>Price:</strong> ${course.Price}
            </p>
            <p>
              <strong>Language:</strong> {course.Language}
            </p>
            <p>
              <strong>Rating:</strong> {course.Rating}
            </p>
            <p>
              <strong>Students:</strong> {course.Students}
            </p>
          </div>
        </>
      ) : (
        <p>Course not found</p>
      )}
    </div>
  );
};

export default CourseDetails;
