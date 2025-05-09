"use client";

import React, { useState, useEffect } from "react";
import classes from "../style/blog.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Loader from "./Loader";

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch(
          "https://skillbridge.runasp.net/api/Blogs?PageIndex=1&PageSize=3"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch blog posts");
        }

        const data = await response.json();
        if (data && data.data) {
          setBlogPosts(data.data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  return (
    <div className={classes.blog}>
      <div className={classes.blog_container}>
        <div className={classes.blog_header}>
          <h3>Blog, News, and Events</h3>
          <Link href="/course/blog">
            View All
            <FontAwesomeIcon
              className={classes.icon}
              icon={faArrowRight}
              width={20}
              height={20}
            />
          </Link>
        </div>

        {isLoading ? (
          <div className={classes.loaderContainer}>
            <Loader />
          </div>
        ) : error ? (
          <div className={classes.errorContainer}>
            <p>Error loading blog posts: {error}</p>
          </div>
        ) : (
          <div className={classes.blog_content}>
            <div className={classes.blog_Card}>
              {blogPosts.map((post) => (
                <div key={post.id} className={classes.blog_Card_content}>
                  <div className={classes.blog_Card_img}>
                    <Image
                      src={post.image || "/blog-placeholder.jpg"}
                      alt={post.title}
                      width={405}
                      height={285}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/blog-placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className={classes.blog_Card_text}>
                    <h5>{new Date(post.createdAt).toLocaleDateString()}</h5>
                    <h2>{post.title}</h2>
                    <p>
                      {post.excerpt || post.content.substring(0, 100) + "..."}
                    </p>
                    <Link href={`/course/BlogDetails/${post.id}`}>
                      Read More
                      <FontAwesomeIcon
                        className={classes.icon}
                        icon={faArrowRight}
                        width={20}
                        height={20}
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;