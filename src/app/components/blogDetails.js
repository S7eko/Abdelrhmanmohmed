"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import classes from "../style/blogDetails.module.css";
import Swal from "sweetalert2";
import Loader from "./Loader";

const BlogDetails = () => {
  // State management
  const [state, setState] = useState({
    blog: null,
    isLoading: true,
    error: null,
  });

  const router = useRouter();
  const { id } = useParams();

  // API endpoint
  const API_ENDPOINT = `https://skillbridge.runasp.net/api/Blogs/${id}`;

  // Helper functions
  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  // Data fetching function
  const fetchBlogDetails = async () => {
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) throw new Error("Failed to fetch blog details");

      const data = await response.json();
      updateState({ blog: data, isLoading: false });
    } catch (error) {
      updateState({ error: error.message, isLoading: false });
    }
  };

  // Effects
  useEffect(() => {
    if (!id) return;
    fetchBlogDetails();
  }, [id]);

  // Render
  if (state.isLoading) return <div><Loader /></div>;
  if (state.error) return <div>Error: {state.error}</div>;

  return (
    <div className={classes.blogDetails}>
      {state.blog ? (
        <>
          {/* Blog details section */}
          <div className={classes.blogDetails_image}>
            <Image
              src={state.blog.image}
              alt={state.blog.title}
              width={400}
              height={280}
            />
          </div>

          <div className={classes.blogDetails_info}>
            <h1><strong>Title:</strong> {state.blog.title}</h1>
            <h2 >
              {state.blog.category}
            </h2>
            <p><strong>Author:</strong> {state.blog.author}</p>
            <p><strong>Published on:</strong> {new Date(state.blog.publishDate).toLocaleDateString()}</p>
            <p><strong>Read Time:</strong> {state.blog.readTime} minutes</p>

            <div>
              <strong>Excerpt:</strong>
              <p>{state.blog.excerpt}</p>
            </div>

            <div>
              <strong>Content:</strong>
              {state.blog.contentBlocks?.map((block, index) => (
                <div key={index}>
                  <p>{block.text}</p>
                  {block.image && <Image src={block.image} alt={`Content image ${index}`} width={500} height={300} />}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className={classes.blogDetails_button}>
            <button className={classes.btn} onClick={() => router.push(`/course/blog`)}>
              Back to Blogs
            </button>
          </div>
        </>
      ) : (
        <p>Blog not found</p>
      )}
    </div>
  );
};

export default BlogDetails;
