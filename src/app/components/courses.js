"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import classes from "../style/courses.module.css";
import Container from "./container";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faClock, faCirclePlay, faUser } from "@fortawesome/free-solid-svg-icons";
import Loader from "./Loader";

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageSize] = useState(6);
  const [categoryFilter, setCategoryFilter] = useState(""); // إضافة فلاتر الفئات
  const [categories, setCategories] = useState([]); // إضافة حالة لتخزين الفئات
  const router = useRouter();

  useEffect(() => {
    // جلب الكورسات والفئات من الـ API
    const fetchCourses = async () => {
      try {
        const courseResponse = await fetch(
          `http://skillbridge.runasp.net/api/courses?pageIndex=${page}&pageSize=${pageSize}`
        );
        const categoryResponse = await fetch(`http://skillbridge.runasp.net/api/categories`);

        if (!courseResponse.ok || !categoryResponse.ok) {
          throw new Error("Failed to fetch courses or categories");
        }

        const courseData = await courseResponse.json();
        const categoryData = await categoryResponse.json();

        if (courseData && courseData.data && courseData.totalCount !== undefined) {
          setCourses(courseData.data);
          setTotalCourses(courseData.totalCount);
        }

        if (categoryData) {
          setCategories(categoryData); // تخزين الفئات في حالة
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [page, pageSize]);

  const totalPages = Math.ceil(totalCourses / pageSize);

  // تصفية الكورسات بناءً على البحث والفئة المحددة
  const filteredCourses = searchQuery
    ? courses.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : categoryFilter
    ? courses.filter((item) => item.category.toLowerCase() === categoryFilter.toLowerCase())
    : courses;

  const handleCategoryClick = (category) => {
    setCategoryFilter(category);
    setSearchQuery(""); // إعادة تعيين استعلام البحث عند اختيار فئة
  };

  const handleCourseClick = (id) => {
    router.push(`/course/${id}`); // التنقل إلى صفحة تفاصيل الكورس
  };

  return (
    <Container>
      <div className={classes.courses}>
        <div className={classes.courses_content}>
          <div className={classes.courses_Search}>
            <div className={classes.courses_Search_input}>
              <input
                type="text"
                placeholder="Search for a course"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={classes.courses_Search_details}>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <a
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                    className={categoryFilter === category.name ? classes.active : ""}
                  >
                    {category.name}
                  </a>
                ))
              ) : (
                <p>استني شويه في مستجعل ليه</p>
              )}
            </div>
          </div>
          <div className={classes.courses_cards}>
            <div className={classes.recommendations_Card}>
              {isLoading ? (
                <div className="spinner"><Loader /></div>
              ) : error ? (
                <p>Error: {error}</p>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((item) => (
                  <div
                    key={item.id}
                    className={classes.recommendations_Card_item}
                    onClick={() => handleCourseClick(item.id)} // عند الضغط على الكورس
                  >
                    <div className={classes.recommendations_Card_item_image}>
                      <Image src={item.image} alt={item.title} loading="lazy" width={380} height={230} />
                      <div className={classes.recommendations_Card_item_star}>
                        <a className={classes.star} href="">
                          <FontAwesomeIcon color="#FCD980" icon={faStar} width={15} height={15} />{" "}
                          {item.rating}
                        </a>
                      </div>
                    </div>
                    <div className={classes.recommendations_Card_item_text}>
                      <h2>{item.title}</h2>
                      <p>{item.description}</p>
                      <div className={classes.recommendations_Card_item_text_icon}>
                        <a href="">
                          <FontAwesomeIcon icon={faClock} width={20} height={20} /> {item.level}
                        </a>
                        <a href="">
                          <FontAwesomeIcon icon={faCirclePlay} width={20} height={20} /> {item.language}
                        </a>
                        <a href="">
                          <FontAwesomeIcon icon={faUser} width={20} height={20} /> {item.students} Students
                        </a>
                      </div>
                      <div className={classes.recommendations_Card_item_price}>
                        <p>Instructor: {item.instructor}</p>
                        <p>Price:Free</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No courses found</p>
              )}
            </div>
          </div>
        </div>

        <div className={classes.pagination}>
          <button onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))} disabled={page === 1}>
            Previous
          </button>

          <button
            onClick={() => setPage((prevPage) => Math.min(prevPage + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </Container>
  );
};

export default Courses;
