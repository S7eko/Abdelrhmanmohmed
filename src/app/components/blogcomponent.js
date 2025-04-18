"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Container from "./container";
import Loader from "./Loader"; // مهم: تأكد أنه اسمه "Loader.js" وليس "loader.js"
import styles from "../style/BlogComponents.module.css";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
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
          throw new Error(`HTTP error! status: ${response.status}`);
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

    const debounceTimer = setTimeout(() => {
      fetchBlogs();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [page, pageSize, searchQuery]);

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
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
            aria-label="Search blogs"
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
            <span className={styles.metaLabel}>Page:</span>
            <span className={styles.metaValue}>{page}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Items per page:</span>
            <span className={styles.metaValue}>{pageSize}</span>
          </div>
          {searchQuery && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Search term:</span>
              <span className={styles.metaValue}>"{searchQuery}"</span>
            </div>
          )}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Total blogs:</span>
            <span className={styles.metaValue}>{totalBlogs}</span>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>Error: {error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No blogs found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.blogGrid}>
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className={styles.blogCard}
                onClick={() => handleBlogClick(blog.id)}
              >
                <div className={styles.imageContainer}>
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    width={380}
                    height={230}
                    className={styles.blogImage}
                    priority={page === 1 && blogs.indexOf(blog) < 2}
                    onError={(e) => {
                      e.target.src = "/images/blog-placeholder.jpg";
                    }}
                  />
                </div>
                <div className={styles.blogContent}>
                  <div className={styles.categoryBadge}>{blog.category}</div>
                  <h2 className={styles.blogTitle}>{blog.title}</h2>
                  <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                  <div className={styles.blogMeta}>
                    <div className={styles.metaItem}>
                      <span>{blog.author}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span>{blog.readTime} min read</span>
                    </div>
                  </div>
                </div>
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
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default BlogList;
