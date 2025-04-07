"use client";
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import classes from "../../style/CommunityPage.module.css";
import Navbar from "../navbar";

const CommunityPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  const [communityData, setCommunityData] = useState([]);
  const [newPost, setNewPost] = useState({ message: '', image: null });
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [allComments, setAllComments] = useState({});
  const [visibleCommentsCount, setVisibleCommentsCount] = useState({});
  const [notifications, setNotifications] = useState([]);

  // جلب بيانات المستخدم الحالي
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://skillbridge.runasp.net/api/User/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setCurrentUser(data))
        .catch(() => setError("❌ Failed to fetch user data."));
    }
  }, []);

  // جلب بيانات المجتمع (المشاركات والتعليقات)
  const fetchCommunityData = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://skillbridge.runasp.net/api/Community/${courseId}`);
      if (!response.ok) throw new Error("Failed to fetch community data");
      const newData = await response.json();
      setCommunityData(newData.reverse());

      // جلب جميع التعليقات لكل مشاركة
      newData.forEach((post) => {
        fetchAllComments(post.id);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  // جلب البيانات بشكل دوري كل 3 ثوانٍ
  useEffect(() => {
    fetchCommunityData();
    const interval = setInterval(fetchCommunityData, 3000);
    return () => clearInterval(interval);
  }, [fetchCommunityData]);

  // جلب جميع التعليقات للمشاركة
  const fetchAllComments = useCallback(async (postId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://skillbridge.runasp.net/api/Community/${postId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const comments = await response.json();
      setAllComments((prev) => ({ ...prev, [postId]: comments }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://skillbridge.runasp.net/api/Notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, []);

  // تمييز الإشعارات كمقروءة
  const markNotificationsAsRead = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://skillbridge.runasp.net/api/Notifications/markRead', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to mark notifications as read");
      fetchNotifications(); // إعادة جلب الإشعارات بعد التحديث
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  }, [fetchNotifications]);

  // جلب الإشعارات عند تحميل الصفحة
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // إضافة مشاركة جديدة
  const handlePostSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!courseId || !newPost.message.trim()) {
      setError('⚠️ Please enter a valid post.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('⚠️ User not authenticated.');
      return;
    }

    const formData = new FormData();
    formData.append('Message', newPost.message);
    if (newPost.image) {
      formData.append('Image', newPost.image);
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://skillbridge.runasp.net/api/Community/${courseId}`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("⚠️ Failed to add post.");

      fetchCommunityData(); // تحديث البيانات بعد النشر
      setNewPost({ message: '', image: null });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, newPost.message, newPost.image, fetchCommunityData]);

  // إضافة تعليق جديد
  const handleCommentSubmit = useCallback(async (postId) => {
    if (!newComment.trim()) {
      setError('⚠️ Comment cannot be empty.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('⚠️ User not authenticated.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://skillbridge.runasp.net/api/Community/comment/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newComment }),
      });

      if (!response.ok) throw new Error("⚠️ Failed to add comment.");

      // إرسال إشعار إلى صاحب المشاركة
      const post = communityData.find((p) => p.id === postId);
      if (post && post.userId !== currentUser.id) {
        await fetch('http://skillbridge.runasp.net/api/Notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: `${currentUser.username} كتب تعليقًا على منشورك: "${newComment}"`,
            userId: post.userId,
          }),
        });
      }

      fetchAllComments(postId); // تحديث التعليقات بعد إضافة تعليق جديد
      setNewComment('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [newComment, fetchAllComments, communityData, currentUser]);

  // حذف مشاركة
  const handleDeletePost = useCallback(async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('⚠️ User not authenticated.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://skillbridge.runasp.net/api/Community/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("⚠️ Failed to delete post.");

      fetchCommunityData(); // تحديث البيانات بعد الحذف
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCommunityData]);

  // عرض المشاركات والتعليقات
  const memoizedPosts = useMemo(() => {
    if (communityData.length === 0) {
      return <div className={classes.noPosts}>🚀 No posts yet! Be the first to post.</div>;
    }

    return communityData.map((post) => {
      const comments = allComments[post.id] || [];
      const visibleCount = visibleCommentsCount[post.id] || 2;

      return (
        <div key={post.id} className={classes.post}>
          <div className={classes.postHeader}>
            <div className={classes.profile}>
              <img src={post.profilePicture} alt={post.username} className={classes.profilePicture} />
              <h3>{post.username}</h3>
            </div>
            <p className={classes.postDate}>{new Date(post.createdDate).toLocaleString()}</p>
            {currentUser?.id === post.userId && (
              <button onClick={() => handleDeletePost(post.id)} className={classes.deleteButton}>❌ Delete</button>
            )}
          </div>
          <p className={classes.postMessage}>{post.message}</p>
          {post.imageUrl && <img src={post.imageUrl} alt="Post" className={classes.image} loading="lazy" />}

          {/* عرض التعليقات */}
          <div className={classes.comments}>
            <h4>💬 Comments:</h4>
            {comments.slice(0, visibleCount).map((comment) => (
              <div key={comment.id} className={classes.comment}>
                <div className={classes.commentHeader}>
                  <img src={comment.profilePictureUrl} alt={comment.username} className={classes.commentProfilePicture} />
                  <strong>{comment.username}</strong>
                  <p className={classes.commentDate}>{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
                <p className={classes.commentMessage}>{comment.message}</p>
              </div>
            ))}

            {/* زر "Show More" أو "Show Less" */}
            {comments.length > 2 && (
              <button
                onClick={() => {
                  if (visibleCount === 2) {
                    setVisibleCommentsCount((prev) => ({ ...prev, [post.id]: comments.length }));
                  } else {
                    setVisibleCommentsCount((prev) => ({ ...prev, [post.id]: 2 }));
                  }
                }}
                className={classes.showMoreButton}
              >
                {visibleCount === 2 ? "💬 Show More" : "💬 Show Less"}
              </button>
            )}
          </div>

          {/* نموذج إضافة تعليق جديد */}
          <div className={classes.commentForm}>
            <input
              type="text"
              placeholder="💬 Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={classes.commentInput}
            />
            <button
              onClick={() => handleCommentSubmit(post.id)}
              className={classes.commentButton}
              disabled={isLoading || !newComment.trim()}
            >
              ➕ Add Comment
            </button>
          </div>
        </div>
      );
    });
  }, [communityData, currentUser, newComment, isLoading, handleCommentSubmit, handleDeletePost, allComments, visibleCommentsCount]);

  return (
    <div className={classes.container}>
      <Navbar notifications={notifications} />
      <h1>👥 Community Page</h1>
      {error && <div className={classes.error}>{error}</div>}
      {memoizedPosts}
      <form onSubmit={handlePostSubmit} className={classes.form}>
        <textarea
          placeholder="✏️ Write your post..."
          value={newPost.message}
          onChange={(e) => setNewPost({ ...newPost, message: e.target.value })}
          className={classes.textarea}
        />
        <input
          type="file"
          onChange={(e) => setNewPost({ ...newPost, image: e.target.files[0] })}
          className={classes.fileInput}
        />
        <button type="submit" className={classes.button} >🚀 Post</button>
      </form>
    </div>
  );
};

export default React.memo(CommunityPage);