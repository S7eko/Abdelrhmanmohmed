"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPenToSquare, faTrashCan, faEye, faChartLine, faFire, faBell } from "@fortawesome/free-solid-svg-icons";
import classes from "../../style/Dashboard.module.css";
import AddCourse from "./addCourse";
import UpdateCourse from "./updateCourse";
import CoursesList from "./courseList";
import DeleteCourse from "./addContent";
import AddQuiz from "./addQuiz";
import AddFile from "./addFile";

const Dashboard = () => {
  const [selectedAction, setSelectedAction] = useState(null); // الحالة للتحكم في العرض

  const handleAddCourseClick = () => {
    setSelectedAction("add");
  };

  const handleUpdateCourseClick = () => {
    setSelectedAction("update");
  };

  const handleViewCoursesClick = () => {
    setSelectedAction("view");
  };

  const handleDeleteCoursesClick = () => {
    setSelectedAction("delete");
  };

  const handleAddQuizClick = () => {
    setSelectedAction("quiz");
  };

  const handleAddFileClick = () => {
    setSelectedAction("file");
  };

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.dashboard_left}>
          <div className={classes.logo}>
            <h1>Admin Dashboard</h1>
          </div>
          <div className={classes.navbar_dashboard}>
            <h2>Admin</h2>
            <ul>
              <li onClick={handleAddCourseClick}>
                <FontAwesomeIcon icon={faPlus} width={20} height={20} />
                Add Course
              </li>
              <li onClick={handleUpdateCourseClick}>
                <FontAwesomeIcon icon={faPenToSquare} width={20} height={20} />
                Update Courses
              </li>
              <li onClick={handleDeleteCoursesClick}>
                <FontAwesomeIcon icon={faPlus} width={20} height={20} />
                Add Content
              </li>
              <li onClick={handleViewCoursesClick}>
                <FontAwesomeIcon icon={faEye} width={20} height={20} />
                View Courses
              </li>
              <li onClick={handleAddQuizClick}>
                <FontAwesomeIcon icon={faPlus} width={20} height={20} />
                Add Quiz
              </li>
              <li onClick={handleAddFileClick}>
                <FontAwesomeIcon icon={faPlus} width={20} height={20} />
                Add File
              </li>
            </ul>
          </div>
        </div>
        <div className={classes.dashboard_right}>
          {/* عرض الرسومات والإحصائيات فقط إذا لم يتم تحديد أي إجراء */}
          {!selectedAction && (
            <div className={classes.dashboard_right_text}>
              <div className={classes.quickStats}>
                <div className={classes.statCard}>
                  <FontAwesomeIcon icon={faChartLine} className={classes.statIcon} />
                  <h3>Total Courses</h3>
                  <p>120</p>
                </div>
                <div className={classes.statCard}>
                  <FontAwesomeIcon icon={faFire} className={classes.statIcon} />
                  <h3>Active Learners</h3>
                  <p>5,678</p>
                </div>
                <div className={classes.statCard}>
                  <FontAwesomeIcon icon={faBell} className={classes.statIcon} />
                  <h3>Pending Actions</h3>
                  <p>3</p>
                </div>
              </div>
              <div className={classes.popularCourses}>
                <h2>Most Popular Courses</h2>
                <ul>
                  <li>Introduction to Programming</li>
                  <li>Advanced Web Development</li>
                  <li>Data Science Fundamentals</li>
                  <li>Machine Learning Basics</li>
                  <li>Mobile App Development</li>
                  <li>UI/UX Design Essentials</li>
                  <li>Cloud Computing Fundamentals</li>
                  
                </ul>
              </div>
              
            </div>
          )}

          {/* عرض المكون المحدد إذا تم اختيار إجراء */}
          <div className={classes.add_component}>
            {selectedAction === "add" && <AddCourse />}
            {selectedAction === "update" && <UpdateCourse />}
            {selectedAction === "view" && <CoursesList />}
            {selectedAction === "delete" && <DeleteCourse />}
            {selectedAction === "quiz" && <AddQuiz />}
            {selectedAction === "file" && <AddFile />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;