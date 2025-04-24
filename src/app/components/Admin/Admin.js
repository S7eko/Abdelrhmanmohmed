"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import classes from "../../style/Dashboard.module.css";
import DeleteBlog from "./deleteBlog";
import DeleteReviews from "./deleteReviews";
import DeletePost from "./deletePost";
import DeletCourse from "./DeleteCourse";
import DeleteSections from "./deletsections";

const Admin = () => {
  const [selectedAction, setSelectedAction] = useState(null);

  // Define all delete handlers
  const handleDeleteCourseClick = () => {
    setSelectedAction("deleteCourse");
  };

  const handleDeleteLectureClick = () => {
    setSelectedAction("deleteLecture");
  };

  const handleDeleteReviewClick = () => {
    setSelectedAction("deleteReview");
  };

  const handleDeleteBlogClick = () => {
    setSelectedAction("deleteBlog");
  };

  const handleDeletePostClick = () => {
    setSelectedAction("deletePost");
  };

  const handleDeleteCommentClick = () => {
    setSelectedAction("deleteComment");
  };

  const handleDeleteSectionClick = () => {
    setSelectedAction("deleteSection");
  };

  // Delete menu items data
  const deleteMenuItems = [
    {
      label: "Delete Course",
      action: "deleteCourse",
      handler: handleDeleteCourseClick
    },
    {
      label: "Delete Section",
      action: "deleteSection",
      handler: handleDeleteSectionClick
    },
    {
      label: "Delete Review",
      action: "deleteReview",
      handler: handleDeleteReviewClick
    },
    {
      label: "Delete Blog",
      action: "deleteBlog",
      handler: handleDeleteBlogClick
    },
    {
      label: "Delete Post",
      action: "deletePost",
      handler: handleDeletePostClick
    },
    {
      label: "Delete Comment",
      action: "deleteComment",
      handler: handleDeleteCommentClick
    }
  ];

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.dashboard_left}>
          <div className={classes.logo}>
            <h1>SkillVerse Admin</h1>
          </div>
          <div className={classes.navbar_dashboard}>
            <h2>Admin</h2>
            <ul>
              {deleteMenuItems.map((item) => (
                <li
                  key={item.action}
                  onClick={item.handler}
                  className={selectedAction === item.action ? classes.active : ''}
                >
                  <FontAwesomeIcon icon={faTrashCan} width={20} height={20} />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={classes.dashboard_right}>
          {!selectedAction && (
            <div className={classes.dashboard_welcome}>
              <DeletCourse />
            </div>
          )}

          <div className={classes.add_component}>
            {selectedAction === "deleteBlog" && <DeleteBlog />}
            {selectedAction === "deleteReview" && <DeleteReviews />}
            {selectedAction === "deletePost" && <DeletePost />}
            {selectedAction === "deleteCourse" && <DeletCourse />}
            {selectedAction === "deleteSection" && <DeleteSections />}




            {/* Add other components here when you implement them */}
            {/* {selectedAction === "deleteCourse" && <DeleteCourse />} */}
            {/* {selectedAction === "deleteLecture" && <DeleteLecture />} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;