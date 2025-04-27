"use client";

import React, { useState, useEffect } from "react";
import classes from "../../style/CourseList.module.css";
import Image from "next/image";
import { BsThreeDotsVertical } from "react-icons/bs";
import Swal from "sweetalert2";
import Loader from "../Loader";

const DeleteCourse = () => {
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://skillbridge.runasp.net/api/courses?pageIndex=${page}&pageSize=${pageSize}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setCourses(data.data);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [page, pageSize]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDeleteCourse = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      const token = localStorage.getItem("token"); // Get token from localStorage

      if (!token) {
        throw new Error("You must be logged in first");
      }

      const response = await fetch(`https://skillbridge.runasp.net/api/Courses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add token to headers
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== id));

      // Reload courses after deletion
      const fetchNewCourses = async () => {
        const newResponse = await fetch(
          `https://skillbridge.runasp.net/api/courses?pageIndex=${page}&pageSize=${pageSize}`
        );
        const newData = await newResponse.json();
        if (newData.data && Array.isArray(newData.data)) {
          setCourses(newData.data);
        }
      };
      fetchNewCourses();

      Swal.fire({
        title: "Deleted!",
        text: "The course has been deleted successfully.",
        icon: "success",
        confirmButtonText: "Okay",
      });
    } catch (error) {
      console.error("Error during deletion:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "An error occurred while deleting.",
        icon: "error",
        confirmButtonText: "Okay",
      });
    }
  };

  if (isLoading) return <div><Loader /></div>;
  if (error) return <p>Error: {error}</p>;
  if (courses.length === 0) return <p>No courses available.</p>;

  return (
    <div className={classes.courseList}>
      {courses.map((course) => (
        <div key={course.id} className={classes.courseItem}>
          <div className={classes.courseInfo}>
            <Image
              src={course.image || "httpss://learnify-assets.s3.amazonaws.com/Images/default-course-image.png"}
              alt={course.title || "Course Image"}
              className={classes.courseImage}
              width={100}
              height={100}
            />
            <div>
              <h3>{course.title || "No Title"}</h3>
              <p>{course.subTitle || "No Subtitle"}</p>
            </div>
          </div>

          {/* Three dots button */}
          <div className={classes.menuWrapper}>
            <button
              className={classes.menuButton}
              onClick={() => setMenuOpen(menuOpen === course.id ? null : course.id)}
            >
              <BsThreeDotsVertical />
            </button>

            {/* Dropdown menu */}
            {menuOpen === course.id && (
              <div className={classes.dropdownMenu}>
                <button onClick={() => handleDeleteCourse(course.id)}>Delete</button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Pagination buttons */}
      <div className={classes.pagination}>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => handlePageChange(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default DeleteCourse;
