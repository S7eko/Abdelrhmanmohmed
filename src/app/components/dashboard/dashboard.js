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
            <h1>SkillVerse Dashboard</h1>
          </div>
          <div className={classes.navbar_dashboard}>
            <h2>Dashboard</h2>
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
                <FontAwesomeIcon icon={faTrashCan} width={20} height={20} />
                Delete Courses
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
              <AddCourse />

              
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