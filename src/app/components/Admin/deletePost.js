"use client";
import React, { useState, useEffect } from "react";
import classes from "../../style/deletePost.module.css";
import Swal from "sweetalert2";

const DeletePost = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You must log in first");

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
            text: "You must log in again",
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
      console.log("Fetching posts for course:", selectedCourse);
      fetchPosts(selectedCourse);
    } else {
      setPosts([]);
    }
  }, [selectedCourse]);

  const fetchPosts = async (courseId) => {
    setPostsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must log in first");

      const response = await fetch(
        `https://skillbridge.runasp.net/api/Community/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching posts: ${response.status}`);
      }

      const data = await response.json();
      console.log("Posts data:", data);
      setPosts(data);
      // Initialize expanded state for each post
      const initialExpandedState = {};
      data.forEach(post => {
        initialExpandedState[post.id] = false;
      });
      setExpandedPosts(initialExpandedState);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error.message);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    setCommentsLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must log in first");

      const response = await fetch(
        `https://skillbridge.runasp.net/api/Community/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.status}`);
      }

      const comments = await response.json();
      console.log("Comments data:", comments);

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments: comments }
            : post
        )
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    if (!expandedPosts[postId]) {
      fetchComments(postId);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover the post after deleting it!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Session expired", "You must log in again", "error");
          return;
        }

        const response = await fetch(
          `https://skillbridge.runasp.net/api/Admin/posts/${postId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Delete response error data:", errorData);
          throw new Error(errorData.message || "Failed to delete the post");
        }

        Swal.fire("Deleted!", "The post has been deleted successfully", "success");
        fetchPosts(selectedCourse);
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover the comment after deleting it!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Session expired", "You must log in again", "error");
          return;
        }

        const response = await fetch(
          `https://skillbridge.runasp.net/api/Admin/comments/${commentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Delete comment response error data:", errorData);
          throw new Error(errorData.message || "Failed to delete the comment");
        }

        Swal.fire("Deleted!", "The comment has been deleted successfully", "success");
        // Refresh comments for the post
        fetchComments(postId);
      } catch (error) {
        console.error("Delete comment error:", error);
        Swal.fire("Error", error.message, "error");
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
        <h3>An error occurred</h3>
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
            <option value="">Select a Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} (ID: {course.id})
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className={classes.postsContainer}>
            <h3>Posts related to the course</h3>
            {postsLoading ? (
              <div className={classes.loadingContainer}>
                <div className={classes.smallSpinner}></div>
                <p>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <p>No posts available for this course</p>
            ) : (
              <div className={classes.postsList}>
                {posts.map((post) => (
                  <div key={post.id} className={classes.postItem}>
                    <div className={classes.postHeader}>
                      {post.profilePicture && (
                        <img
                          src={post.profilePicture}
                          alt={post.username}
                          className={classes.userImage}
                        />
                      )}
                      <div>
                        <span className={classes.postAuthor}>
                          {post.username}
                        </span>
                      </div>
                    </div>
                    <p className={classes.postMessage}>{post.message}</p>

                    <div className={classes.commentsContainer}>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className={classes.toggleCommentsButton}
                      >
                        {expandedPosts[post.id] ? "Hide Comments" : "Show Comments"}
                      </button>

                      {expandedPosts[post.id] && (
                        <>
                          <h4>Comments</h4>
                          {commentsLoading[post.id] ? (
                            <div className={classes.loadingContainer}>
                              <div className={classes.smallSpinner}></div>
                              <p>Loading comments...</p>
                            </div>
                          ) : post.comments && post.comments.length > 0 ? (
                            <ul className={classes.commentsList}>
                              {post.comments.map((comment) => (
                                <li key={comment.id} className={classes.commentItem}>
                                  <div className={classes.commentHeader}>
                                    <span className={classes.commentAuthor}>
                                      {comment.username}:
                                    </span>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id, post.id)}
                                      className={classes.deleteCommentButton}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                  <p className={classes.commentText}>{comment.message}</p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No comments available</p>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className={classes.deleteButton}
                    >
                      Delete Post
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

export default DeletePost;
