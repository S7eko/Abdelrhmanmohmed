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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("يجب تسجيل الدخول أولاً");

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
            errorData.message || `خطأ في جلب الكورسات: ${response.status}`
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
            title: "انتهت الجلسة",
            text: "يجب تسجيل الدخول مرة أخرى",
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
      if (!token) throw new Error("يجب تسجيل الدخول أولاً");

      const response = await fetch(
        `https://skillbridge.runasp.net/api/Community/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`خطأ في جلب البوستات: ${response.status}`);
      }

      const data = await response.json();
      console.log("Posts data:", data);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error.message);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع البوست بعد حذفه!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "إلغاء",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("انتهت الجلسة", "يجب تسجيل الدخول مرة أخرى", "error");
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
          throw new Error(errorData.message || "فشل في حذف البوست");
        }

        Swal.fire("تم الحذف!", "تم حذف البوست بنجاح", "success");
        fetchPosts(selectedCourse);
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("خطأ", error.message, "error");
      }
    }
  };

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>جاري تحميل الكورسات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <div className={classes.errorIcon}>!</div>
        <h3>حدث خطأ</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={classes.retryButton}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.form}>
        <div className={classes.SelectCourse}>
          <label>اختر الكورس:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={classes.selectInput}
          >
            <option value="">اختر كورس</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} (ID: {course.id})
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className={classes.postsContainer}>
            <h3>البوستات المتعلقة بالكورس</h3>
            {postsLoading ? (
              <div className={classes.loadingContainer}>
                <div className={classes.smallSpinner}></div>
                <p>جاري تحميل البوستات...</p>
              </div>
            ) : posts.length === 0 ? (
              <p>لا توجد بوستات لهذا الكورس</p>
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
                      <h4>التعليقات</h4>
                      {post.comments && post.comments.length > 0 ? (
                        <ul>
                          {post.comments.map((comment) => (
                            <li key={comment.id}>
                              <span className={classes.commentAuthor}>
                                {comment.username}:
                              </span>
                              <span>{comment.message}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>لا توجد تعليقات</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className={classes.deleteButton}
                    >
                      حذف البوست
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
