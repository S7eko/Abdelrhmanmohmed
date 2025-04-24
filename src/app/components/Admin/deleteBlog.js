"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Container from "../container";
import Loader from "../Loader";
import styles from "../../style/BlogComponents.module.css";
import Swal from 'sweetalert2';

const DeleteBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, [page, pageSize, searchQuery]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        PageIndex: page.toString(),
        PageSize: pageSize.toString(),
        ...(searchQuery && { Search: searchQuery }),
      });

      const response = await fetch(
        `https://skillbridge.runasp.net/api/Blogs?${queryParams}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid data format received from API");
      }

      setBlogs(data.data);
      setTotalBlogs(data.totalCount || 0);
    } catch (err) {
      setError(err.message || "An unknown error occurred");
      console.error("Error fetching blogs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const result = await Swal.fire({
        title: 'هل أنت متأكد؟',
        text: "لن تتمكن من استعادة هذه المقالة!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'نعم، احذفها!',
        cancelButtonText: 'إلغاء',
        reverseButtons: true
      });

      if (!result.isConfirmed) return;

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      const response = await fetch(
        `https://skillbridge.runasp.net/api/Admin/blogs/${blogId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Handle 403 Forbidden response specifically
      if (response.status === 403) {
        throw new Error("ليس لديك صلاحية لحذف هذه المقالة");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في حذف المقالة');
      }

      // Optimistic update
      setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogId));
      setTotalBlogs(prevTotal => prevTotal - 1);

      // If the last item on the page was deleted, go to previous page
      if (blogs.length === 1 && page > 1) {
        setPage(page - 1);
      }

      await Swal.fire(
        'تم الحذف!',
        'تم حذف المقالة بنجاح.',
        'success'
      );
    } catch (error) {
      console.error('Error deleting blog:', error);
      await Swal.fire(
        'خطأ!',
        error.message || 'حدث خطأ أثناء محاولة حذف المقالة.',
        'error'
      );
    }
  };

  const totalPages = Math.ceil(totalBlogs / pageSize);

  const handleBlogClick = (id) => {
    router.push(`/course/BlogDetails/${id}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <Container>
      <div className={styles.blogContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="ابحث عن المقالات..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
            aria-label="ابحث عن المقالات"
          />
          <svg
            className={styles.searchIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>الصفحة:</span>
            <span className={styles.metaValue}>{page}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>عدد العناصر:</span>
            <span className={styles.metaValue}>{pageSize}</span>
          </div>
          {searchQuery && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>كلمة البحث:</span>
              <span className={styles.metaValue}>"{searchQuery}"</span>
            </div>
          )}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>إجمالي المقالات:</span>
            <span className={styles.metaValue}>{totalBlogs}</span>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>خطأ: {error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              إعادة المحاولة
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>لا توجد مقالات مطابقة لبحثك.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={styles.clearSearchButton}
              >
                مسح البحث
              </button>
            )}
          </div>
        ) : (
          <div className={styles.blogGrid}>
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className={styles.blogCard}
              >
                <div
                  className={styles.imageContainer}
                  onClick={() => handleBlogClick(blog.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleBlogClick(blog.id)}
                >
                  <Image
                    src={blog.image || "/images/blog-placeholder.jpg"}
                    alt={blog.title || "صورة المقالة"}
                    width={380}
                    height={230}
                    className={styles.blogImage}
                    priority={page === 1 && blogs.indexOf(blog) < 2}
                    onError={(e) => {
                      e.target.src = "/images/blog-placeholder.jpg";
                    }}
                  />
                </div>
                <div
                  className={styles.blogContent}
                  onClick={() => handleBlogClick(blog.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleBlogClick(blog.id)}
                >
                  <div className={styles.categoryBadge}>{blog.category || "عام"}</div>
                  <h2 className={styles.blogTitle}>{blog.title || "بدون عنوان"}</h2>
                  <p className={styles.blogExcerpt}>{blog.excerpt || "لا يوجد محتوى"}</p>
                  <div className={styles.blogMeta}>
                    <div className={styles.metaItem}>
                      <span>{blog.author || "مجهول"}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span>{blog.readTime || 0} دقيقة قراءة</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBlog(blog.id);
                  }}
                  className={styles.deleteButton}
                  aria-label={`حذف المقالة ${blog.title}`}
                >
                  حذف المقالة
                </button>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className={styles.paginationButton}
              aria-label="الصفحة السابقة"
            >
              السابق
            </button>
            <span className={styles.pageInfo}>
              الصفحة {page} من {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className={styles.paginationButton}
              aria-label="الصفحة التالية"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default DeleteBlog;